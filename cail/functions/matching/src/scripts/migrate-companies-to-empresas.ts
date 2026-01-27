/**
 * Script de Migración: companies -> empresas
 * 
 * Migra todos los documentos de la colección 'companies' a 'empresas'
 * con transformación de campos al español.
 * 
 * Uso:
 *   npx ts-node src/scripts/migrate-companies-to-empresas.ts --preview
 *   npx ts-node src/scripts/migrate-companies-to-empresas.ts
 *   npx ts-node src/scripts/migrate-companies-to-empresas.ts --delete-original
 */

import { initializeFirebase, getFirestore } from '../config/firebase.config';
import { FieldValue } from '@google-cloud/firestore';

// ============================================
// CONFIGURACIÓN
// ============================================

const SOURCE_COLLECTION = 'companies';
const TARGET_COLLECTION = 'empresas';

// Flags de línea de comandos
const args = process.argv.slice(2);
const PREVIEW_MODE = args.includes('--preview');
const DELETE_ORIGINAL = args.includes('--delete-original');

// ============================================
// INTERFACES
// ============================================

interface CompanyDoc {
    businessName?: string;
    tradeName?: string;
    ruc?: string;
    tipo_empresa?: string;
    direccion?: string;
    contact?: {
        email?: string;
        phone?: string;
    };
    id_sector_industrial?: string;
    validationStatus?: string;
    createdAt?: FirebaseFirestore.Timestamp;
}

interface EmpresaDoc {
    razon_social: string;
    nombre_comercial: string;
    ruc: string;
    tipo_empresa: string;
    direccion: string;
    contacto: {
        email: string;
        telefono: string;
    };
    id_sector_industrial: string;
    estado_validacion: string;
    created_at: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
    migrated_from_companies: boolean;
    migrated_at: FirebaseFirestore.FieldValue;
}

// ============================================
// FUNCIONES DE MIGRACIÓN
// ============================================

function transformCompanyToEmpresa(companyDoc: CompanyDoc, docId: string): EmpresaDoc {
    return {
        razon_social: companyDoc.businessName || '',
        nombre_comercial: companyDoc.tradeName || companyDoc.businessName || '',
        ruc: companyDoc.ruc || '',
        tipo_empresa: companyDoc.tipo_empresa || 'Privada',
        direccion: companyDoc.direccion || '',
        contacto: {
            email: companyDoc.contact?.email || '',
            telefono: companyDoc.contact?.phone || '',
        },
        id_sector_industrial: companyDoc.id_sector_industrial || '',
        estado_validacion: companyDoc.validationStatus || 'PENDIENTE',
        created_at: companyDoc.createdAt || FieldValue.serverTimestamp(),
        migrated_from_companies: true,
        migrated_at: FieldValue.serverTimestamp(),
    };
}

async function fetchAllCompanies(db: FirebaseFirestore.Firestore): Promise<{ id: string; data: CompanyDoc }[]> {
    console.log(`\n📖 Leyendo colección '${SOURCE_COLLECTION}'...`);

    const snapshot = await db.collection(SOURCE_COLLECTION).get();

    if (snapshot.empty) {
        console.log(`⚠️ La colección '${SOURCE_COLLECTION}' está vacía o no existe.`);
        return [];
    }

    const companies = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data() as CompanyDoc
    }));

    console.log(`✅ Encontradas ${companies.length} empresas en '${SOURCE_COLLECTION}'`);
    return companies;
}

async function migrateCompanies(db: FirebaseFirestore.Firestore) {
    const companies = await fetchAllCompanies(db);

    if (companies.length === 0) {
        console.log('\n❌ No hay datos para migrar.');
        return;
    }

    console.log('\n📋 Detalle de empresas a migrar:');
    console.log('─'.repeat(60));

    for (const company of companies) {
        const transformed = transformCompanyToEmpresa(company.data, company.id);
        console.log(`\n📌 ${company.id}`);
        console.log(`   Razón Social:     ${transformed.razon_social}`);
        console.log(`   Nombre Comercial: ${transformed.nombre_comercial}`);
        console.log(`   RUC:              ${transformed.ruc}`);
        console.log(`   Sector:           ${transformed.id_sector_industrial}`);
        console.log(`   Tipo:             ${transformed.tipo_empresa}`);
        console.log(`   Email:            ${transformed.contacto.email}`);
        console.log(`   Teléfono:         ${transformed.contacto.telefono}`);
        console.log(`   Estado:           ${transformed.estado_validacion}`);
    }

    if (PREVIEW_MODE) {
        console.log('\n' + '═'.repeat(60));
        console.log('🔍 MODO PREVIEW - No se realizaron cambios');
        console.log('   Para ejecutar la migración, quita el flag --preview');
        console.log('═'.repeat(60));
        return;
    }

    // Ejecutar migración
    console.log('\n🚀 Iniciando migración...');
    const empresasCollection = db.collection(TARGET_COLLECTION);
    let successCount = 0;
    let errorCount = 0;

    for (const company of companies) {
        try {
            const transformed = transformCompanyToEmpresa(company.data, company.id);

            // Usar el mismo ID del documento original
            await empresasCollection.doc(company.id).set(transformed);

            console.log(`   ✅ Migrado: ${transformed.razon_social} -> ${company.id}`);
            successCount++;
        } catch (error) {
            console.error(`   ❌ Error migrando ${company.id}:`, error);
            errorCount++;
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('═'.repeat(60));
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Errores:  ${errorCount}`);
    console.log(`   📁 Colección destino: ${TARGET_COLLECTION}`);

    // Eliminar colección original si se especificó
    if (DELETE_ORIGINAL && successCount > 0 && errorCount === 0) {
        console.log('\n🗑️  Eliminando colección original...');

        for (const company of companies) {
            await db.collection(SOURCE_COLLECTION).doc(company.id).delete();
            console.log(`   🗑️  Eliminado: ${company.id}`);
        }

        console.log(`\n✅ Colección '${SOURCE_COLLECTION}' eliminada exitosamente.`);
    } else if (DELETE_ORIGINAL && errorCount > 0) {
        console.log('\n⚠️ No se eliminó la colección original debido a errores durante la migración.');
    } else if (!DELETE_ORIGINAL) {
        console.log(`\n💡 La colección original '${SOURCE_COLLECTION}' se mantiene intacta.`);
        console.log('   Para eliminarla, ejecuta con: --delete-original');
    }

    console.log('═'.repeat(60));
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 CAIL - Migración de Colección: companies -> empresas');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📅 Fecha: ${new Date().toISOString()}`);
    console.log(`🔍 Modo Preview: ${PREVIEW_MODE ? 'SÍ' : 'NO'}`);
    console.log(`🗑️  Eliminar Original: ${DELETE_ORIGINAL ? 'SÍ' : 'NO'}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        // Inicializar Firebase
        initializeFirebase();
        const db = getFirestore();

        // Ejecutar migración
        await migrateCompanies(db);

        console.log('\n✅ Script de migración completado.\n');
    } catch (error) {
        console.error('\n❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar
main();
