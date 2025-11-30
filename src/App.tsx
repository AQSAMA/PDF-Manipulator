import React, { useCallback, useEffect, useRef, useState } from 'react';
import PdfUploader from './components/PdfUploader';
import SheetSettings from './components/SheetSettings';
import BorderControls from './components/BorderControls';
import PagePreview from './components/PagePreview';
import usePdfWorker, { PdfSettings } from './hooks/usePdfWorker';

const DEFAULT_SETTINGS: PdfSettings = {
    pagesPerSheet: 1,
    rotation: 0,
    borderWidth: 0,
    paperSize: 'auto',
};

const App: React.FC = () => {
    const [settings, setSettings] = useState<PdfSettings>(DEFAULT_SETTINGS);
    const { 
        files, 
        activeFile, 
        activeFileId, 
        setActiveFileId, 
        addFiles, 
        removeFile, 
        processAllFiles, 
        status, 
        reset 
    } = usePdfWorker();
    
    const isFirstRender = useRef(true);

    const handleFilesUpload = useCallback(async (uploadedFiles: File[]) => {
        const filesWithBuffers = await Promise.all(
            uploadedFiles.map(async (file) => ({
                file,
                buffer: await file.arrayBuffer(),
            }))
        );
        addFiles(filesWithBuffers, settings);
    }, [addFiles, settings]);

    // Re-process all files only when settings change (not on first render or file changes)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (files.length === 0) return;
        processAllFiles(settings);
    }, [settings]); // Only depend on settings, not files or processAllFiles

    const handleDownload = () => {
        if (!activeFile?.blob) return;
        const url = URL.createObjectURL(activeFile.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeFile.name.replace(/\.pdf$/i, '')}-manipulated.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadAll = () => {
        files.forEach((file) => {
            if (file.blob) {
                const url = URL.createObjectURL(file.blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${file.name.replace(/\.pdf$/i, '')}-manipulated.pdf`;
                link.click();
                URL.revokeObjectURL(url);
            }
        });
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        reset();
    };

    const readyFilesCount = files.filter(f => f.status === 'ready').length;

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="app-header__content">
                    <p className="eyebrow">PDF toolkit</p>
                    <h1>High-performance PDF sheet composer</h1>
                    <p className="lede">
                        Upload PDFs, tweak sheet layouts, rotate orientation, and add printable borders. 
                        Supports multiple files. All processing happens in your browser.
                    </p>
                </div>
                <div className="status-pill" data-status={status}>
                    {status === 'processing' && 'Processing…'}
                    {status === 'ready' && `${readyFilesCount} file${readyFilesCount !== 1 ? 's' : ''} ready`}
                    {status === 'idle' && 'Awaiting upload'}
                    {status === 'error' && 'Something went wrong'}
                </div>
            </header>

            <main className="layout">
                <section className="panel stack">
                    <PdfUploader 
                        onFilesUpload={handleFilesUpload} 
                        files={files}
                        activeFileId={activeFileId}
                        onFileSelect={setActiveFileId}
                        onFileRemove={removeFile}
                    />

                    <SheetSettings
                        pagesPerSheet={settings.pagesPerSheet}
                        rotation={settings.rotation}
                        paperSize={settings.paperSize}
                        onPagesPerSheetChange={(value) => setSettings((prev) => ({ ...prev, pagesPerSheet: value }))}
                        onRotationChange={(value) => setSettings((prev) => ({ ...prev, rotation: value }))}
                        onPaperSizeChange={(value) => setSettings((prev) => ({ ...prev, paperSize: value }))}
                    />

                    <BorderControls
                        borderWidth={settings.borderWidth}
                        onBorderWidthChange={(value) => setSettings((prev) => ({ ...prev, borderWidth: value }))}
                    />

                    <div className="action-row">
                        <button 
                            className="button primary" 
                            onClick={handleDownload} 
                            disabled={!activeFile?.blob || status === 'processing'}
                        >
                            Download Current
                        </button>
                        {files.length > 1 && (
                            <button 
                                className="button secondary" 
                                onClick={handleDownloadAll} 
                                disabled={readyFilesCount === 0 || status === 'processing'}
                            >
                                Download All ({readyFilesCount})
                            </button>
                        )}
                        <button className="button ghost" onClick={handleReset} disabled={files.length === 0}>
                            Reset
                        </button>
                    </div>
                </section>

                <section className="preview-panel">
                    <PagePreview
                        files={files}
                        activeFile={activeFile}
                        activeFileId={activeFileId}
                        onFileSelect={setActiveFileId}
                        overallStatus={status}
                    />
                </section>
            </main>
        </div>
    );
};

export default App;