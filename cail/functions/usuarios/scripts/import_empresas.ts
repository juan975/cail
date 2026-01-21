import * as admin from 'firebase-admin';
import * as XLSX from 'xlsx';

// Inicializar Firebase Admin
// Nota: Se requiere haber hecho login con 'gcloud auth application-default login' 
// o tener la variable GOOGLE_APPLICATION_CREDENTIALS configurada.
if (!admin.apps.length) {
    try {
        admin.initializeApp();
        console.log('Firebase Admin inicializado.');
    } catch (error) {
        console.error('Error inicializando Firebase Admin:', error);
        process.exit(1);
    }
}

const db = admin.firestore();

async function importEmpresas(filePath: string) {
    try {
        console.log(`Leyendo archivo: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Leer la primera hoja
        const sheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        // defval: '' asegura que celdas vacías no rompan la estructura si es necesario, 
        // pero aquí queremos detectar filas válidas.
        const data = XLSX.utils.sheet_to_json(sheet) as any[];

        if (data.length === 0) {
            console.log('El archivo Excel parece estar vacío o no tiene formato legible.');
            return;
        }

        console.log(`Encontrados ${data.length} registros en la hoja '${sheetName}'.`);
        console.log('Primera fila de ejemplo:', data[0]);

        const batchSize = 400; // Límite de Firestore es 500 operations/batch
        let batch = db.batch();
        let count = 0;
        let totalImported = 0;
        let errors = 0;

        for (const row of data) {
            // Normalizar nombres de columnas
            // Se busca RUC (o ruc) y RAZON_SOCIAL (o razon_social, Razon Social, etc)
            let ruc = row['RUC'] || row['ruc'] || row['Ruc'];
            let razonSocial = row['RAZON_SOCIAL'] || row['razon_social'] || row['RAZON SOCIAL'] || row['Razon Social'] || row['Nombre'] || row['NOMBRE_COMERCIAL'];

            // Limpiar RUC (convertir a string y quitar espacios)
            if (ruc) {
                ruc = String(ruc).trim();
            }

            if (!ruc) {
                // Si no hay RUC, saltamos
                continue;
            }

            const docRef = db.collection('empresas').doc(ruc);

            // Usamos set con merge: true para no borrar otros campos si existieran, 
            // aunque para importación inicial podría ser solo set.
            batch.set(docRef, {
                ruc: ruc,
                razonSocial: razonSocial || 'Sin Razón Social',
                estado: 'ACTIVA',
                fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
                origen: 'importacion_excel'
            }, { merge: true });

            count++;

            if (count >= batchSize) {
                await batch.commit();
                totalImported += count;
                console.log(`Procesados ${totalImported} registros...`);
                batch = db.batch(); // Nuevo batch
                count = 0;
            }
        }

        // Commit final
        if (count > 0) {
            await batch.commit();
            totalImported += count;
        }

        console.log(`✅ Importación finalizada exitosamente.`);
        console.log(`Total empresas importadas/actualizadas: ${totalImported}`);

    } catch (error) {
        console.error('❌ Error durante la importación:', error);
    }
}

// Ejecutar
const args = process.argv.slice(2);
if (args.length > 0) {
    importEmpresas(args[0]).catch(console.error);
} else {
    console.log('⚠️  Debes especificar la ruta al archivo Excel.');
    console.log('Uso: npx ts-node scripts/import_empresas.ts <ruta-archivo.xlsx>');
}
