import { useCallback, useEffect, useRef, useState } from 'react';

export type PdfStatus = 'idle' | 'processing' | 'ready' | 'error';

export type PaperSize = 'auto' | 'letter' | 'legal' | 'a4' | 'a3' | 'tabloid';

export interface PdfSettings {
    pagesPerSheet: number;
    rotation: number;
    borderWidth: number;
    paperSize: PaperSize;
}

export interface ProcessedFile {
    id: string;
    name: string;
    size: number;
    previewUrl: string | null;
    blob: Blob | null;
    status: PdfStatus;
    error: string | null;
}

interface WorkerSuccessPayload {
    pdfBytes: ArrayBuffer;
    fileId: string;
}

interface WorkerErrorPayload {
    message: string;
    fileId: string;
}

const usePdfWorker = () => {
    const workerRef = useRef<Worker | null>(null);
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const buffersRef = useRef<Map<string, ArrayBuffer>>(new Map());
    const settingsRef = useRef<PdfSettings | null>(null);

    const overallStatus: PdfStatus = files.length === 0 
        ? 'idle' 
        : files.some(f => f.status === 'processing') 
            ? 'processing' 
            : files.some(f => f.status === 'error')
                ? 'error'
                : files.every(f => f.status === 'ready')
                    ? 'ready'
                    : 'idle';

    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/pdfWorker.ts', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (event: MessageEvent<{ type: 'success' | 'error'; payload: WorkerSuccessPayload | WorkerErrorPayload }>) => {
            if (event.data.type === 'success') {
                const payload = event.data.payload as WorkerSuccessPayload;
                const blob = new Blob([payload.pdfBytes], { type: 'application/pdf' });
                const previewUrl = URL.createObjectURL(blob);
                
                setFiles(prev => prev.map(f => {
                    if (f.id === payload.fileId) {
                        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                        return { ...f, blob, previewUrl, status: 'ready' as PdfStatus, error: null };
                    }
                    return f;
                }));
                return;
            }

            const payload = event.data.payload as WorkerErrorPayload;
            setFiles(prev => prev.map(f => {
                if (f.id === payload.fileId) {
                    return { ...f, status: 'error' as PdfStatus, error: payload.message || 'Unable to process PDF.' };
                }
                return f;
            }));
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Process a single file
    const processFile = useCallback((fileId: string, settings: PdfSettings) => {
        if (!workerRef.current) return;
        const buffer = buffersRef.current.get(fileId);
        if (!buffer) return;
        
        setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'processing' as PdfStatus } : f
        ));
        
        const transferable = buffer.slice(0);
        workerRef.current.postMessage(
            { type: 'process', payload: { buffer: transferable, settings, fileId } },
            [transferable]
        );
    }, []);

    // Process all files with given settings
    const processAllFiles = useCallback((settings: PdfSettings) => {
        settingsRef.current = settings;
        buffersRef.current.forEach((_, fileId) => {
            processFile(fileId, settings);
        });
    }, [processFile]);

    // Add files and immediately process them
    const addFiles = useCallback((newFiles: Array<{ file: File; buffer: ArrayBuffer }>, settings: PdfSettings) => {
        const processedFiles: ProcessedFile[] = newFiles.map(({ file, buffer }) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            buffersRef.current.set(id, buffer);
            return {
                id,
                name: file.name,
                size: file.size,
                previewUrl: null,
                blob: null,
                status: 'processing' as PdfStatus,
                error: null,
            };
        });

        setFiles(prev => [...prev, ...processedFiles]);
        setActiveFileId(prev => prev ?? processedFiles[0]?.id ?? null);
        
        // Process new files immediately
        processedFiles.forEach(f => {
            processFile(f.id, settings);
        });
        
        return processedFiles.map(f => f.id);
    }, [processFile]);

    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === fileId);
            if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
            const remaining = prev.filter(f => f.id !== fileId);
            return remaining;
        });
        buffersRef.current.delete(fileId);
        
        setActiveFileId(prev => {
            if (prev === fileId) {
                const remainingIds = Array.from(buffersRef.current.keys());
                return remainingIds.length > 0 ? remainingIds[0] : null;
            }
            return prev;
        });
    }, []);

    const reset = useCallback(() => {
        setFiles(prev => {
            prev.forEach(f => {
                if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
            });
            return [];
        });
        buffersRef.current.clear();
        setActiveFileId(null);
    }, []);

    const activeFile = files.find(f => f.id === activeFileId) || null;

    return { 
        files,
        activeFile,
        activeFileId,
        setActiveFileId,
        addFiles,
        removeFile,
        processAllFiles,
        status: overallStatus,
        reset 
    };
};

export default usePdfWorker;