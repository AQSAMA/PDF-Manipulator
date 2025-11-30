import { useCallback, useEffect, useRef, useState } from 'react';

export type PdfStatus = 'idle' | 'processing' | 'ready' | 'error';

export interface PdfSettings {
    pagesPerSheet: number;
    rotation: number;
    borderWidth: number;
}

interface WorkerSuccessPayload {
    pdfBytes: ArrayBuffer;
}

interface WorkerErrorPayload {
    message: string;
}

const usePdfWorker = () => {
    const workerRef = useRef<Worker | null>(null);
    const [status, setStatus] = useState<PdfStatus>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/pdfWorker.ts', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (event: MessageEvent<{ type: 'success' | 'error'; payload: WorkerSuccessPayload | WorkerErrorPayload }>) => {
            if (event.data.type === 'success') {
                const payload = event.data.payload as WorkerSuccessPayload;
                const blob = new Blob([payload.pdfBytes], { type: 'application/pdf' });
                setDownloadBlob(blob);
                setStatus('ready');
                setError(null);
                setPreviewUrl((previous: string | null) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return URL.createObjectURL(blob);
                });
                return;
            }

            const payload = event.data.payload as WorkerErrorPayload;
            setStatus('error');
            setError(payload.message || 'Unable to process PDF.');
        };

        return () => {
            workerRef.current?.terminate();
                    setPreviewUrl((previous: string | null) => {
                        if (previous) URL.revokeObjectURL(previous);
                return null;
            });
        };
    }, []);

    const processPdf = useCallback((buffer: ArrayBuffer, settings: PdfSettings) => {
        if (!workerRef.current) return;
        setStatus('processing');
        const transferable = buffer.slice(0);
        workerRef.current.postMessage({ type: 'process', payload: { buffer: transferable, settings } }, [transferable]);
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
        setDownloadBlob(null);
            setPreviewUrl((previous: string | null) => {
            if (previous) URL.revokeObjectURL(previous);
            return null;
        });
    }, []);

    return { processPdf, previewUrl, downloadBlob, status, error, reset };
};

export default usePdfWorker;