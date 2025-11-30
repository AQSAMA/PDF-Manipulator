import React from 'react';
import type { ProcessedFile, PdfStatus } from '../hooks/usePdfWorker';

interface PagePreviewProps {
    files: ProcessedFile[];
    activeFile: ProcessedFile | null;
    activeFileId: string | null;
    onFileSelect: (fileId: string) => void;
    overallStatus: PdfStatus;
}

const PagePreview: React.FC<PagePreviewProps> = ({ files, activeFile, activeFileId, onFileSelect, overallStatus }) => {
    const hasFiles = files.length > 0;
    const isProcessing = activeFile?.status === 'processing';
    const previewUrl = activeFile?.previewUrl || null;

    return (
        <div className="preview-card">
            <header className="preview-card__header">
                <div className="preview-card__title-wrap">
                    <p className="panel__eyebrow">Live preview</p>
                    <h2 className="preview-card__title" title={activeFile?.name}>
                        {activeFile?.name ?? 'Awaiting upload'}
                    </h2>
                </div>
                {activeFile && <span className="tag">PDF</span>}
            </header>

            {files.length > 1 && (
                <div className="preview-tabs">
                    {files.map((file, index) => (
                        <button
                            key={file.id}
                            className={`preview-tab ${activeFileId === file.id ? 'preview-tab--active' : ''}`}
                            onClick={() => onFileSelect(file.id)}
                            title={file.name}
                        >
                            <span className="preview-tab__number">{index + 1}</span>
                            <span className="preview-tab__name">{file.name}</span>
                            {file.status === 'processing' && <span className="spinner spinner--small" />}
                            {file.status === 'ready' && (
                                <svg className="preview-tab__check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="preview-stage">
                {!hasFiles && <p className="preview-placeholder">Upload PDFs to see them rendered with your current settings.</p>}
                {hasFiles && isProcessing && <p className="preview-placeholder">Crunching pages…</p>}
                {hasFiles && !isProcessing && previewUrl && (
                    <object data={previewUrl} type="application/pdf" aria-label="PDF preview" className="preview-frame">
                        <p>Your browser cannot display PDFs inline. Use the download button instead.</p>
                    </object>
                )}
                {hasFiles && !isProcessing && !previewUrl && activeFile?.error && (
                    <p className="preview-placeholder preview-placeholder--error">{activeFile.error}</p>
                )}
            </div>
        </div>
    );
};

export default PagePreview;