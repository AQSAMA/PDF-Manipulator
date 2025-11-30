import React, { useCallback, useRef, useState } from 'react';

interface PdfUploaderProps {
    onFileUpload: (file: File) => void;
    fileName?: string | null;
    fileSize?: string | null;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onFileUpload, fileName, fileSize }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            const file = files?.[0];
            if (!file) return;
            if (file.type !== 'application/pdf') {
                alert('Please upload a PDF file.');
                return;
            }
            onFileUpload(file);
        },
        [onFileUpload]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(event.target.files);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

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
                    onChange={handleChange}
                    hidden
                />
                <p className="drop-zone__title">Drop your PDF here or browse</p>
                <p className="drop-zone__hint">Maximum 100 MB. We process everything in your browser.</p>
                <button type="button" className="button secondary" onClick={() => inputRef.current?.click()}>
                    Choose a file
                </button>
                {fileName && (
                    <div className="file-pill">
                        <span>{fileName}</span>
                        {fileSize && <span className="file-size">{fileSize}</span>}
                    </div>
                )}
            </label>
        </section>
    );
};

export default PdfUploader;