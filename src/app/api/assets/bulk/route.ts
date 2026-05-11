import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const tenantId = formData.get('tenantId') as string;
    const companyId = formData.get('companyId') as string;
    const mappingJson = formData.get('mapping') as string;

    if (!file || !tenantId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'file and tenantId required' } },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: 'Sadece Excel (.xlsx/.xls) veya CSV dosyasi yuklenebilir' } },
        { status: 422 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { parseSpreadsheet } = await import('@/lib/engines/assetEngine/importer');
    const parsed = await parseSpreadsheet(buffer, file.name);

    // If no mapping provided, return headers for column mapping UI
    if (!mappingJson) {
      return NextResponse.json({
        success: true,
        data: {
          phase: 'mapping_required',
          headers: parsed.headers,
          previewRows: parsed.rows.slice(0, 5),
          totalRows: parsed.totalRows,
        },
      });
    }

    // Process with mapping
    const mapping = JSON.parse(mappingJson);
    const { bulkCreateAssets } = await import('@/lib/engines/assetEngine');
    const result = await bulkCreateAssets(tenantId, companyId || tenantId, parsed.rows, mapping);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Toplu import basarisiz';
    logger.error('Bulk asset import error', 'AssetsAPI', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message } },
      { status: 500 }
    );
  }
}
