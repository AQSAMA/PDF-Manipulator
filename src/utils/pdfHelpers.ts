export const rotatePage = (pdfDoc, pageNumber, degrees) => {
    const page = pdfDoc.getPage(pageNumber);
    return page.then((page) => {
        return page.rotate(degrees);
    });
};

export const mergePages = (pdfDocs) => {
    const mergedPdf = new PDFDocument();
    pdfDocs.forEach((pdfDoc) => {
        pdfDoc.getPages().forEach((page) => {
            mergedPdf.addPage(page);
        });
    });
    return mergedPdf;
};

export const setBorders = (pdfDoc, borderWidth, borderColor) => {
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
        page.drawRectangle({
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
            borderColor: borderColor,
            borderWidth: borderWidth,
        });
    });
};

export const adjustPagesPerSheet = (pdfDoc, pagesPerSheet) => {
    const totalPages = pdfDoc.getPages().length;
    const newDoc = new PDFDocument();
    for (let i = 0; i < totalPages; i += pagesPerSheet) {
        const pageGroup = pdfDoc.getPages().slice(i, i + pagesPerSheet);
        newDoc.addPage(pageGroup);
    }
    return newDoc;
};