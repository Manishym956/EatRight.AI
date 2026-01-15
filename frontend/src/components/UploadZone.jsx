import { useState, useRef } from 'react';
import './UploadZone.css';

function UploadZone({ onFileSelect, onUpload, selectedFile, previewUrl, error }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                onFileSelect(file);
            }
        }
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="upload-zone-container">
            {!selectedFile ? (
                <div
                    className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="upload-content">
                        <button
                            className="upload-button"
                            onClick={handleClick}
                            aria-label="Upload food image"
                        >
                            <div className="upload-button-inner">
                                <svg
                                    className="camera-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                            <div className="pulse-ring"></div>
                            <div className="pulse-ring pulse-ring-2"></div>
                        </button>

                        <h2 className="upload-title">Capture or Upload Your Meal</h2>
                        <p className="upload-description">
                            Take a photo or drag & drop an image to get instant nutrition insights
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileInputChange}
                            className="file-input"
                            aria-label="File input"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="preview-container">
                    <div className="preview-card glass">
                        <img src={previewUrl} alt="Selected meal" className="preview-image" />
                        <div className="preview-overlay">
                            <button className="change-button" onClick={handleClick}>
                                Change Photo
                            </button>
                        </div>
                    </div>

                    <button className="analyze-button btn-primary" onClick={onUpload}>
                        <span>Analyze Meal</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

export default UploadZone;
