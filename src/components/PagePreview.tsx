import React from 'react';

interface PagePreviewProps {
    previewUrl: string | null;
    isProcessing: boolean;
    hasFile: boolean;
    fileName?: string | null;
}

const PagePreview: React.FC<PagePreviewProps> = ({ previewUrl, isProcessing, hasFile, fileName }) => {
    return (
        <div className="preview-card">
            <header className="preview-card__header">
                <div>
                    <p className="panel__eyebrow">Live preview</p>
                    <h2>{fileName ?? 'Awaiting upload'}</h2>
                </div>
                {fileName && <span className="tag">PDF</span>}
            </header>

            <div className="preview-stage">
                {!hasFile && <p className="preview-placeholder">Upload a PDF to see it rendered with your current settings.</p>}
                {hasFile && isProcessing && <p className="preview-placeholder">Crunching pages…</p>}
                {hasFile && !isProcessing && previewUrl && (
                    <object data={previewUrl} type="application/pdf" aria-label="PDF preview" className="preview-frame">
                        <p>Your browser cannot display PDFs inline. Use the download button instead.</p>
                    </object>
                )}
            </div>
        </div>
    );
};

export default PagePreview;