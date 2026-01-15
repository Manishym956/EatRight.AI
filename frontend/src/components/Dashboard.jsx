import { useState } from 'react';
import UploadZone from './UploadZone';
import ScanningAnimation from './ScanningAnimation';
import ResultsCard from './ResultsCard';
import { uploadMeal } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
    const [appState, setAppState] = useState('idle'); // idle, uploading, scanning, results, error
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const { token } = useAuth(); // Get auth token

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setAppState('uploading');

        try {
            // Simulate upload delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            setAppState('scanning');

            // Upload to backend (pass token if available)
            const response = await uploadMeal(selectedFile, token);

            // Show scanning animation for at least 2 seconds for better UX
            await new Promise(resolve => setTimeout(resolve, 2000));

            setResults(response);
            setAppState('results');
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to analyze meal. Please try again.');
            setAppState('error');
        }
    };

    const handleReset = () => {
        setAppState('idle');
        setSelectedFile(null);
        setPreviewUrl(null);
        setResults(null);
        setError(null);
    };

    return (
        <div className="dashboard-container">
            {(appState === 'idle' || appState === 'error') && (
                <UploadZone
                    onFileSelect={handleFileSelect}
                    onUpload={handleUpload}
                    selectedFile={selectedFile}
                    previewUrl={previewUrl}
                    error={error}
                />
            )}

            {(appState === 'uploading' || appState === 'scanning') && (
                <ScanningAnimation
                    imageUrl={previewUrl}
                    isScanning={appState === 'scanning'}
                />
            )}

            {appState === 'results' && results && (
                <ResultsCard
                    results={results}
                    imageUrl={previewUrl}
                    onReset={handleReset}
                />
            )}
        </div>
    );
}

export default Dashboard;
