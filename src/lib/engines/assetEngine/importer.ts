import { logger } from '@/lib/logger';

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, string | number | undefined>[];
  totalRows: number;
}

export async function parseSpreadsheet(fileBuffer: Buffer, fileName: string): Promise<ParsedSpreadsheet> {
  let XLSX: typeof import('xlsx');

  try {
    XLSX = await import('xlsx');
  } catch {
    logger.error('xlsx package not installed — run: npm install xlsx', 'Importer');
    throw new Error('Excel okuma kutuphanesi yuklu degil. npm install xlsx calistirin.');
  }

  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    throw new Error('Excel dosyasinda sayfa bulunamadi.');
  }

  const sheet = workbook.Sheets[firstSheet];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number | undefined>>(sheet, {
    defval: undefined,
    raw: true,
  });

  if (jsonData.length === 0) {
    throw new Error('Excel dosyasi bos veya baslik satiri eksik.');
  }

  const headers = Object.keys(jsonData[0]);

  logger.info(`Spreadsheet parsed: ${jsonData.length} rows, ${headers.length} columns`, 'Importer', {
    fileName,
    headers,
  });

  return {
    headers,
    rows: jsonData,
    totalRows: jsonData.length,
  };
}
