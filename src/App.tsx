import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PdfUploader from './components/PdfUploader';
import SheetSettings from './components/SheetSettings';
import BorderControls from './components/BorderControls';
import PagePreview from './components/PagePreview';
import usePdfWorker, { PdfSettings } from './hooks/usePdfWorker';

const DEFAULT_SETTINGS: PdfSettings = {
    pagesPerSheet: 1,
    rotation: 0,
    borderWidth: 0,
};

const App: React.FC = () => {
    const [settings, setSettings] = useState<PdfSettings>(DEFAULT_SETTINGS);
    const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
    const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
    const { processPdf, previewUrl, downloadBlob, status, error, reset } = usePdfWorker();

    const handleFileUpload = useCallback(async (file: File) => {
        const buffer = await file.arrayBuffer();
        setFileBuffer(buffer);
        setFileMeta({ name: file.name, size: file.size });
    }, []);

    useEffect(() => {
        if (!fileBuffer) {
            return;
        }
        processPdf(fileBuffer, settings);
    }, [fileBuffer, settings, processPdf]);

    const formattedFileSize = useMemo(() => {
        if (!fileMeta) return null;
        const kb = fileMeta.size / 1024;
        if (kb < 1024) {
            return `${kb.toFixed(1)} KB`;
        }
        return `${(kb / 1024).toFixed(2)} MB`;
    }, [fileMeta]);

    const handleDownload = () => {
        if (!downloadBlob || !fileMeta) return;
        const url = URL.createObjectURL(downloadBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileMeta.name.replace(/\.pdf$/i, '')}-manipulated.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setFileBuffer(null);
        setFileMeta(null);
        setSettings(DEFAULT_SETTINGS);
        reset();
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <div>
                    <p className="eyebrow">PDF toolkit</p>
                    <h1>High-performance PDF sheet composer</h1>
                    <p className="lede">
                        Upload a PDF, tweak sheet layouts, rotate orientation, and add printable borders. Optimized for desktop and mobile,
                        deployable anywhere including GitHub Pages.
                    </p>
                </div>
                <div className="status-pill" data-status={status}>
                    {status === 'processing' && 'Processing…'}
                    {status === 'ready' && 'Preview ready'}
                    {status === 'idle' && 'Awaiting upload'}
                    {status === 'error' && 'Something went wrong'}
                </div>
            </header>

            <main className="layout">
                <section className="panel stack">
                    <PdfUploader onFileUpload={handleFileUpload} fileName={fileMeta?.name} fileSize={formattedFileSize} />

                    <SheetSettings
                        pagesPerSheet={settings.pagesPerSheet}
                        rotation={settings.rotation}
                        onPagesPerSheetChange={(value) => setSettings((prev) => ({ ...prev, pagesPerSheet: value }))}
                        onRotationChange={(value) => setSettings((prev) => ({ ...prev, rotation: value }))}
                    />

                    <BorderControls
                        borderWidth={settings.borderWidth}
                        onBorderWidthChange={(value) => setSettings((prev) => ({ ...prev, borderWidth: value }))}
                    />

                    <div className="action-row">
                        <button className="button primary" onClick={handleDownload} disabled={!downloadBlob || status === 'processing'}>
                            Download PDF
                        </button>
                        <button className="button ghost" onClick={handleReset} disabled={!fileMeta}>
                            Reset
                        </button>
                    </div>

                    {error && <p className="error-text">{error}</p>}
                </section>

                <section className="preview-panel">
                    <PagePreview
                        previewUrl={previewUrl}
                        isProcessing={status === 'processing'}
                        hasFile={Boolean(fileMeta)}
                        fileName={fileMeta?.name}
                    />
                </section>
            </main>
        </div>
    );
};

export default App;