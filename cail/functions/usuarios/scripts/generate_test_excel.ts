import * as XLSX from 'xlsx';
import * as path from 'path';

const data = [
    { RUC: '1790012345001', RAZON_SOCIAL: 'CORPORACION FAVORITA C.A.' },
    { RUC: '0990004196001', RAZON_SOCIAL: 'CONECEL S.A.' },
    { RUC: '1791234567001', RAZON_SOCIAL: 'BANCO PICHINCHA C.A.' },
    { RUC: '0190001234001', RAZON_SOCIAL: 'ETAPA EP' },
    { RUC: '0991234567001', RAZON_SOCIAL: 'CERVECERIA NACIONAL CN S.A.' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Empresas');

const filePath = path.join(__dirname, '..', 'empresas_test.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Archivo de prueba creado en: ${filePath}`);
