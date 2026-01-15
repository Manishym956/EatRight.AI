import { useEffect, useState } from 'react';
import './ScanningAnimation.css';

function ScanningAnimation({ imageUrl, isScanning }) {
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        if (isScanning) {
            const interval = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) return 0;
                    return prev + 2;
                });
            }, 50);

            return () => clearInterval(interval);
        }
    }, [isScanning]);

    return (
        <div className="scanning-container">
            <div className="scanning-card glass">
                <div className="scanning-image-wrapper">
                    <img src={imageUrl} alt="Analyzing meal" className="scanning-image" />

                    {/* Scanning Overlay */}
                    <div className="scanning-overlay">
                        {/* Scanning Line */}
                        <div className="scan-line"></div>

                        {/* Corner Brackets */}
                        <div className="corner-bracket top-left"></div>
                        <div className="corner-bracket top-right"></div>
                        <div className="corner-bracket bottom-left"></div>
                        <div className="corner-bracket bottom-right"></div>

                        {/* Scanning Grid */}
                        <div className="scanning-grid"></div>

                        {/* Pulse Circles */}
                        <div className="pulse-circle pulse-1"></div>
                        <div className="pulse-circle pulse-2"></div>
                        <div className="pulse-circle pulse-3"></div>
                    </div>
                </div>

                {/* Status Section */}
                <div className="scanning-status">
                    <div className="status-header">
                        <div className="ai-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h3 className="status-title">AI Analysis in Progress</h3>
                    </div>

                    <div className="status-messages">
                        <div className="status-message">
                            <div className="message-dot"></div>
                            <span>Identifying food items</span>
                        </div>
                        <div className="status-message">
                            <div className="message-dot"></div>
                            <span>Analyzing nutritional content</span>
                        </div>
                        <div className="status-message">
                            <div className="message-dot"></div>
                            <span>Generating health insights</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${scanProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Floating Particles */}
            <div className="particles">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        '--delay': `${i * 0.2}s`,
                        '--x': `${Math.random() * 200 - 100}px`,
                        '--y': `${Math.random() * 200 - 100}px`
                    }}></div>
                ))}
            </div>
        </div>
    );
}

export default ScanningAnimation;
