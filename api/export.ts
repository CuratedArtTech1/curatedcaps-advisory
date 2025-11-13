import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Artwork } from '../lib/supabase';

const fmtMoney = (n: number | string | undefined) =>
  `$${(parseFloat(String(n || 0))).toLocaleString()}`;

export async function generateFactSheetPDF(art: Artwork): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 54;
  let y = margin;

  const imageData = art.image_data_url || art.image_data;
  if (imageData) {
    try {
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      const maxW = pageW - margin * 2;
      const maxH = 300;

      let imgW = img.width;
      let imgH = img.height;

      if (imgW > maxW) {
        imgH = (maxW / imgW) * imgH;
        imgW = maxW;
      }

      if (imgH > maxH) {
        imgW = (maxH / imgH) * imgW;
        imgH = maxH;
      }

      const xPos = (pageW - imgW) / 2;

      doc.addImage(imageData, 'JPEG', xPos, y, imgW, imgH, undefined, 'FAST');
      y += imgH + 20;
    } catch (e) {
      doc.setDrawColor(170);
      const boxH = 260;
      doc.rect(margin, y, pageW - margin * 2, boxH);
      doc.text('Image not available', margin + 8, y + 18);
      y += boxH + 20;
    }
  } else {
    doc.setDrawColor(170);
    const boxH = 260;
    doc.rect(margin, y, pageW - margin * 2, boxH);
    doc.text('Image not available', margin + 8, y + 18);
    y += boxH + 20;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text(String(art.artist || ''), margin, y);
  y += 22;

  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  const workline = `${art.title || ''}${art.year ? `, ${art.year}` : ''}`;
  doc.text(workline, margin, y);
  y += 18;

  const kv = (txt?: string) => {
    if (txt) {
      doc.text(String(txt), margin, y);
      y += 16;
    }
  };
  kv(art.medium);
  kv(art.dimensions);

  const addBlock = (heading: string, body?: string) => {
    if (!body) return;
    if (y > 720) { doc.addPage(); y = margin; }
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(heading, margin, y);
    y += 14;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const split = doc.splitTextToSize(String(body), pageW - margin * 2);
    split.forEach((line) => {
      if (y > 760) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 14;
    });
    y += 4;
  };

  addBlock('Provenance', art.provenance);
  addBlock('Exhibition', art.exhibition);
  addBlock('Literature', art.literature);
  addBlock('Owner Information', art.owner_info);

  const metaRows: [string, string][] = [];
  if (art.price) metaRows.push(['Appraisal value', fmtMoney(art.price)]);
  if (art.insurance_value) metaRows.push(['Insurance value', fmtMoney(art.insurance_value)]);
  if (art.location) metaRows.push(['Location', String(art.location)]);

  if (metaRows.length) {
    if (y > 740) { doc.addPage(); y = margin; }
    autoTable(doc, {
      startY: y,
      head: [['Field', 'Value']],
      body: metaRows,
      styles: { font: 'times', fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
      theme: 'grid',
      margin: { left: margin, right: margin },
      tableWidth: pageW - margin * 2,
    });
  }

  return doc.output('blob');
}

export function exportExcel(artworks: Artwork[]) {
  if (!artworks.length) return;
  const rows = artworks.map(a => ({
    ID: a.id,
    Artist: a.artist,
    Title: a.title,
    Year: a.year,
    Medium: a.medium,
    Dimensions: a.dimensions,
    Condition: a.condition,
    Price: a.price,
    Location: a.location,
    Provenance: a.provenance,
    Exhibitions: a.exhibition,
    Literature: a.literature,
    Notes: a.notes,
    ClientId: a.client_id,
    CreatedAt: a.created_at,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Artworks');
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  saveAs(
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `inventory_${new Date().toISOString().slice(0,10)}.xlsx`
  );
}

export async function exportFactSheetsZip(artworks: Artwork[], clientName = 'Client') {
  if (!artworks.length) return;
  const zip = new JSZip();

  for (const a of artworks) {
    const blob = await generateFactSheetPDF(a);
    const safe = (s?: string) => String(s || '').replace(/[^A-Za-z0-9._-]+/g, '_');
    const fname = `FactSheet_${safe(clientName)}_${safe(a.artist)}_${safe(a.title)}_${a.id || 'x'}.pdf`;
    zip.file(`${safe(clientName)}/FactSheets/${fname}`, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `FactSheets_${new Date().toISOString().slice(0,10)}.zip`);
}

export function exportCSV(data: any[], name: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj =>
    Object.values(obj).map(v =>
      typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : (v ?? '')
    ).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  saveAs(blob, `${name}_${new Date().toISOString().split('T')[0]}.csv`);
}
