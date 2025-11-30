import { PDFDocument, rgb, degrees } from 'pdf-lib';

export interface PdfSettings {
  pagesPerSheet: number;
  rotation: number;
  borderWidth: number;
}

function getGridConfig(pagesPerSheet: number): { cols: number; rows: number } {
  // Optimal grid to maximize sheet usage:
  // 2-up: 1 col × 2 rows (vertical stack)
  // 4-up: 2 cols × 2 rows
  // 6-up: 2 cols × 3 rows
  // 8-up: 2 cols × 4 rows
  switch (pagesPerSheet) {
    case 2:
      return { cols: 1, rows: 2 };
    case 4:
      return { cols: 2, rows: 2 };
    case 6:
      return { cols: 2, rows: 3 };
    case 8:
      return { cols: 2, rows: 4 };
    default:
      return { cols: 1, rows: 1 };
  }
}

async function processDocument(buffer: ArrayBuffer, settings: PdfSettings): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer);
  const srcPages = srcDoc.getPages();
  const outDoc = await PDFDocument.create();

  const { cols, rows } = getGridConfig(settings.pagesPerSheet);
  const tilesPerSheet = cols * rows;

  // Use Letter-size output: 612 × 792 pts
  const outputWidth = 612;
  const outputHeight = 792;
  const cellWidth = outputWidth / cols;
  const cellHeight = outputHeight / rows;

  for (let i = 0; i < srcPages.length; i += tilesPerSheet) {
    const outPage = outDoc.addPage([outputWidth, outputHeight]);

    for (let t = 0; t < tilesPerSheet; t++) {
      const srcIndex = i + t;
      if (srcIndex >= srcPages.length) break;

      const [embeddedPage] = await outDoc.embedPdf(srcDoc, [srcIndex]);

      const srcW = embeddedPage.width;
      const srcH = embeddedPage.height;

      // Scale to fit cell with small padding (2%)
      const scale = Math.min(cellWidth / srcW, cellHeight / srcH) * 0.98;

      // Grid position: left-to-right, top-to-bottom reading order
      const col = t % cols;
      const row = rows - 1 - Math.floor(t / cols); // PDF y-axis starts at bottom

      // Center tile within its cell
      const cx = col * cellWidth + cellWidth / 2;
      const cy = row * cellHeight + cellHeight / 2;

      outPage.drawPage(embeddedPage, {
        x: cx - (srcW * scale) / 2,
        y: cy - (srcH * scale) / 2,
        xScale: scale,
        yScale: scale,
        rotate: degrees(settings.rotation),
      });

      // Draw border around tile cell (gray color)
      if (settings.borderWidth > 0) {
        outPage.drawRectangle({
          x: col * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0.3, 0.3, 0.3),
          borderWidth: settings.borderWidth,
        });
      }
    }
  }

  return outDoc.save();
}

self.onmessage = async (event: MessageEvent<{ type: string; payload: { buffer: ArrayBuffer; settings: PdfSettings } }>) => {
  const { type, payload } = event.data;
  if (type !== 'process') return;

  try {
    const pdfBytes = await processDocument(payload.buffer, payload.settings);
    self.postMessage({ type: 'success', payload: { pdfBytes: pdfBytes.buffer } }, [pdfBytes.buffer] as any);
  } catch (err: any) {
    self.postMessage({ type: 'error', payload: { message: err?.message ?? 'Unknown error' } });
  }
};
