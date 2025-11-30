import React from 'react';
import type { PaperSize } from '../hooks/usePdfWorker';

interface SheetSettingsProps {
    pagesPerSheet: number;
    rotation: number;
    paperSize: PaperSize;
    onPagesPerSheetChange: (value: number) => void;
    onRotationChange: (value: number) => void;
    onPaperSizeChange: (value: PaperSize) => void;
}

const SHEET_OPTIONS = [1, 2, 4, 6, 8];
const ROTATION_OPTIONS = [0, 90, 180, 270];
const PAPER_SIZE_OPTIONS: { value: PaperSize; label: string }[] = [
    { value: 'auto', label: 'Auto (best fit)' },
    { value: 'letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'legal', label: 'Legal (8.5 × 14 in)' },
    { value: 'a4', label: 'A4 (210 × 297 mm)' },
    { value: 'a3', label: 'A3 (297 × 420 mm)' },
    { value: 'tabloid', label: 'Tabloid (11 × 17 in)' },
];

const SheetSettings: React.FC<SheetSettingsProps> = ({ pagesPerSheet, rotation, paperSize, onPagesPerSheetChange, onRotationChange, onPaperSizeChange }) => {
    return (
        <section className="panel">
            <header className="panel__header">
                <div>
                    <p className="panel__eyebrow">Sheet layout</p>
                    <h2>Control how pages align</h2>
                </div>
            </header>

            <div className="form-grid">
                <label className="form-field">
                    <span>Paper size</span>
                    <select value={paperSize} onChange={(event) => onPaperSizeChange(event.target.value as PaperSize)}>
                        {PAPER_SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>Pages per sheet</span>
                    <select value={pagesPerSheet} onChange={(event) => onPagesPerSheetChange(parseInt(event.target.value, 10))}>
                        {SHEET_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option} per sheet
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>Rotation</span>
                    <select value={rotation} onChange={(event) => onRotationChange(parseInt(event.target.value, 10))}>
                        {ROTATION_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}°
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </section>
    );
};

export default SheetSettings;