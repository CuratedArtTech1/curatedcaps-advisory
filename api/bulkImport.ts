import * as XLSX from 'xlsx';
import JSZip from 'jszip';

const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

function composeDims(r: any): string {
  const num = (x: any) => (x === '' || x == null) ? '' : String(x);
  const units = r.units || r.unit || '';
  const parts = [num(r.height), num(r.width), num(r.depth)].filter(Boolean).join(' × ');
  const framedParts = [num(r.framed_height), num(r.framed_width), num(r.framed_depth)]
    .filter(Boolean)
    .join(' × ');
  return [
    parts ? `${parts} ${units}`.trim() : '',
    framedParts ? `Framed: ${framedParts} ${units}`.trim() : ''
  ].filter(Boolean).join('; ');
}

export type BulkArtwork = {
  client_id?: string;
  artist: string;
  title: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  condition?: string;
  location?: string;
  price?: number;
  provenance?: string;
  exhibition?: string;
  literature?: string;
  notes?: string;
  image_data?: string;
};

export type BulkImportResult = {
  created: number;
  errors: Array<{ row: number; error: string }>;
};

export async function bulkImport(
  sheetFile: File | null,
  imagesZipFile: File | null,
  applyRow: (art: BulkArtwork) => void
): Promise<BulkImportResult> {
  if (!sheetFile) throw new Error('Upload a CSV/XLSX file');

  const buf = await sheetFile.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

  let imageMap: Record<string, string> = {};
  if (imagesZipFile) {
    const zip = await JSZip.loadAsync(imagesZipFile);
    const files = Object.values(zip.files).filter(f => !f.dir);
    for (const f of files) {
      const base = f.name.split('/').pop() || '';
      const ext = (base.split('.').pop() || '').toLowerCase();
      if (['jpg', 'jpeg', 'png'].includes(ext)) {
        const blob = await f.async('blob');
        const dataURL = await fileToDataURL(
          new File([blob], base, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` })
        );
        imageMap[base] = dataURL;
      }
    }
  }

  const norm = (s: any) => String(s).trim().toLowerCase().replace(/\s+/g, '_');
  const required = ['client_email', 'artist', 'title'];
  const missing = required.filter(
    k => !Object.keys(rows[0] || {}).map(norm).includes(k)
  );
  if (missing.length) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }

  let created = 0;
  const errors: Array<{ row: number; error: string }> = [];

  rows.forEach((row: any, i) => {
    try {
      const r: Record<string, any> = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [norm(k), v])
      );

      const art: BulkArtwork = {
        client_id: r.client_id || r.client || r.client_email || '',
        artist: r.artist || '',
        title: r.title || '',
        year: r.year || '',
        medium: r.medium || '',
        dimensions: r.dimensions || composeDims(r),
        condition: r.condition || 'Excellent',
        location: r.location || '',
        price: r.price || r.appraisal_value || undefined,
        provenance: r.provenance || '',
        exhibition: r.exhibition || r.exhibition_history || '',
        literature: r.literature || '',
        notes: r.notes || '',
        image_data: undefined,
      };

      const primFile = (r.primary_image_filename || '').trim();
      if (primFile && imageMap[primFile]) {
        art.image_data = imageMap[primFile];
      }

      applyRow(art);
      created++;
    } catch (e: any) {
      errors.push({ row: i + 2, error: e.message });
    }
  });

  return { created, errors };
}
