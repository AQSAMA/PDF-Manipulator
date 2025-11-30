import React, { useCallback, useRef, useState } from 'react';
import type { ProcessedFile } from '../hooks/usePdfWorker';

interface PdfUploaderProps {
    onFilesUpload: (files: File[]) => void;
    files: ProcessedFile[];
    activeFileId: string | null;
    onFileSelect: (fileId: string) => void;
    onFileRemove: (fileId: string) => void;
}

const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(2)} MB`;
};

const PdfUploader: React.FC<PdfUploaderProps> = ({ onFilesUpload, files, activeFileId, onFileSelect, onFileRemove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFiles = useCallback(
        (fileList: FileList | null) => {
            if (!fileList) return;
            const validFiles: File[] = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (file.type === 'application/pdf') {
                    validFiles.push(file);
                }
            }
            if (validFiles.length === 0) {
                alert('Please upload PDF files only.');
                return;
            }
            onFilesUpload(validFiles);
        },
        [onFilesUpload]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(event.target.files);
        // Reset input so same file can be re-uploaded
        event.target.value = '';
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleRemoveFile = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        onFileRemove(fileId);
    };

    return (
        <section className="uploader">
            <label
                htmlFor="pdf-upload"
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={inputRef}
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleChange}
                    hidden
                />
                <p className="drop-zone__title">Drop PDFs here or browse</p>
                <p className="drop-zone__hint">Multiple files supported. Max 100 MB each. Processed in browser.</p>
                <button type="button" className="button secondary" onClick={() => inputRef.current?.click()}>
                    Choose files
                </button>
            </label>

            {files.length > 0 && (
                <div className="file-list">
                    <div className="file-list__header">
                        <span className="file-list__count">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                    </div>
                    <ul className="file-list__items">
                        {files.map((file) => (
                            <li 
                                key={file.id} 
                                className={`file-item ${activeFileId === file.id ? 'file-item--active' : ''}`}
                                onClick={() => onFileSelect(file.id)}
                            >
                                <div className="file-item__icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <div className="file-item__info">
                                    <span className="file-item__name" title={file.name}>{file.name}</span>
                                    <span className="file-item__size">{formatFileSize(file.size)}</span>
                                </div>
                                <div className="file-item__status" data-status={file.status}>
                                    {file.status === 'processing' && (
                                        <span className="spinner" />
                                    )}
                                    {file.status === 'ready' && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                    {file.status === 'error' && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="15" y1="9" x2="9" y2="15" />
                                            <line x1="9" y1="9" x2="15" y2="15" />
                                        </svg>
                                    )}
                                </div>
                                <button 
                                    className="file-item__remove" 
                                    onClick={(e) => handleRemoveFile(e, file.id)}
                                    title="Remove file"
                                    type="button"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};

export default PdfUploader;