import React from 'react';

interface BorderControlsProps {
    borderWidth: number;
    onBorderWidthChange: (value: number) => void;
}

const BorderControls: React.FC<BorderControlsProps> = ({ borderWidth, onBorderWidthChange }) => {
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
            </div>
        </section>
    );
};

export default BorderControls;