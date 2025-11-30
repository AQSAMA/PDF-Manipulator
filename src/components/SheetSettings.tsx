import React from 'react';

interface SheetSettingsProps {
    pagesPerSheet: number;
    rotation: number;
    onPagesPerSheetChange: (value: number) => void;
    onRotationChange: (value: number) => void;
}

const SHEET_OPTIONS = [1, 2, 4, 6, 8];
const ROTATION_OPTIONS = [0, 90, 180, 270];

const SheetSettings: React.FC<SheetSettingsProps> = ({ pagesPerSheet, rotation, onPagesPerSheetChange, onRotationChange }) => {
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