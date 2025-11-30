import { PDFDocument, rgb, degrees } from 'pdf-lib';

export type PaperSize = 'auto' | 'letter' | 'legal' | 'a4' | 'a3' | 'tabloid';

export interface PdfSettings {
  pagesPerSheet: number;
  rotation: number;
  borderWidth: number;
  paperSize: PaperSize;
}

// Paper sizes in points (72 points = 1 inch)
const PAPER_SIZES: Record<Exclude<PaperSize, 'auto'>, { width: number; height: number; name: string }> = {
  letter: { width: 612, height: 792, name: 'Letter' },      // 8.5 × 11 inches
  legal: { width: 612, height: 1008, name: 'Legal' },       // 8.5 × 14 inches
  a4: { width: 595, height: 842, name: 'A4' },              // 210 × 297 mm
  a3: { width: 842, height: 1191, name: 'A3' },             // 297 × 420 mm
  tabloid: { width: 792, height: 1224, name: 'Tabloid' },   // 11 × 17 inches
};

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

/**
 * Automatically determines the best paper size based on source page dimensions
 * and the number of pages per sheet to optimize space utilization.
 */
function autoDetectPaperSize(
  srcWidth: number,
  srcHeight: number,
  pagesPerSheet: number
): { width: number; height: number } {
  const { cols, rows } = getGridConfig(pagesPerSheet);
  
  // Calculate the total content area needed (with 2% padding for each cell)
  const contentWidth = srcWidth * cols;
  const contentHeight = srcHeight * rows;
  
  // Score each paper size based on space utilization
  // Higher score = better fit (less wasted space while content still fits)
  const paperSizeKeys = Object.keys(PAPER_SIZES) as Exclude<PaperSize, 'auto'>[];
  
  let bestSize = PAPER_SIZES.letter;
  let bestScore = -Infinity;
  
  for (const key of paperSizeKeys) {
    const paper = PAPER_SIZES[key];
    
    // Try both portrait and landscape orientations
    const orientations = [
      { width: paper.width, height: paper.height },
      { width: paper.height, height: paper.width },
    ];
    
    for (const orientation of orientations) {
      const cellWidth = orientation.width / cols;
      const cellHeight = orientation.height / rows;
      
      // Check if content fits with padding
      const scaledW = cellWidth * 0.98;
      const scaledH = cellHeight * 0.98;
      
      // Calculate the scale factor needed to fit the source in the cell
      const scale = Math.min(scaledW / srcWidth, scaledH / srcHeight);
      
      // Calculate actual used area vs total paper area
      const usedWidth = srcWidth * scale * cols;
      const usedHeight = srcHeight * scale * rows;
      const usedArea = usedWidth * usedHeight;
      const paperArea = orientation.width * orientation.height;
      
      // Space utilization ratio (higher is better)
      const utilization = usedArea / paperArea;
      
      // Penalize if scale is very small (content becomes too tiny)
      // Ideal scale is around 1.0 (no scaling needed) or slightly less
      const scalePenalty = scale > 1 ? 0.5 : scale < 0.3 ? scale : 1;
      
      const score = utilization * scalePenalty;
      
      if (score > bestScore) {
        bestScore = score;
        bestSize = { width: orientation.width, height: orientation.height, name: paper.name };
      }
    }
  }
  
  return { width: bestSize.width, height: bestSize.height };
}

function getPaperDimensions(
  paperSize: PaperSize,
  srcWidth: number,
  srcHeight: number,
  pagesPerSheet: number
): { width: number; height: number } {
  if (paperSize === 'auto') {
    return autoDetectPaperSize(srcWidth, srcHeight, pagesPerSheet);
  }
  
  const paper = PAPER_SIZES[paperSize];
  const { cols, rows } = getGridConfig(pagesPerSheet);
  
  // Determine if landscape orientation would be better for the content
  const portraitCellAspect = (paper.width / cols) / (paper.height / rows);
  const landscapeCellAspect = (paper.height / cols) / (paper.width / rows);
  const srcAspect = srcWidth / srcHeight;
  
  // Choose orientation that better matches source aspect ratio
  const portraitDiff = Math.abs(portraitCellAspect - srcAspect);
  const landscapeDiff = Math.abs(landscapeCellAspect - srcAspect);
  
  if (landscapeDiff < portraitDiff) {
    return { width: paper.height, height: paper.width };
  }
  
  return { width: paper.width, height: paper.height };
}

async function processDocument(buffer: ArrayBuffer, settings: PdfSettings): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer);
  const srcPages = srcDoc.getPages();
  const outDoc = await PDFDocument.create();

  const { cols, rows } = getGridConfig(settings.pagesPerSheet);
  const tilesPerSheet = cols * rows;

  // Get the first page dimensions to determine paper size
  const firstPage = srcPages[0];
  const srcWidth = firstPage.getWidth();
  const srcHeight = firstPage.getHeight();

  // Determine output paper dimensions based on settings
  const { width: outputWidth, height: outputHeight } = getPaperDimensions(
    settings.paperSize,
    srcWidth,
    srcHeight,
    settings.pagesPerSheet
  );
  
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
