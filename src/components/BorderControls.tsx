import React from 'react';

interface BorderControlsProps {
    borderWidth: number;
    borderColor: string;
    onBorderWidthChange: (value: number) => void;
    onBorderColorChange: (value: string) => void;
}

const BorderControls: React.FC<BorderControlsProps> = ({ borderWidth, borderColor, onBorderWidthChange, onBorderColorChange }) => {
    return (
        <section className="panel">
            <header className="panel__header">
                <div>
                    <p className="panel__eyebrow">Borders</p>
                    <h2>Frame each tile</h2>
                </div>
            </header>
            <div className="form-grid">
                <label className="form-field">
                    <span>Border width (pt)</span>
                    <input
                        type="range"
                        min={0}
                        max={12}
                        value={borderWidth}
                        onChange={(event) => onBorderWidthChange(parseInt(event.target.value, 10))}
                    />
                    <span className="range-value">{borderWidth} pt</span>
                </label>

                <label className="form-field color">
                    <span>Border color</span>
                    <input type="color" value={borderColor} onChange={(event) => onBorderColorChange(event.target.value)} />
                </label>
            </div>
        </section>
    );
};

export default BorderControls;