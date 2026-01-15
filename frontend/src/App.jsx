import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ScanningAnimation from './components/ScanningAnimation';
import ResultsCard from './components/ResultsCard';
import { uploadMeal } from './utils/api';

function App() {
  const [appState, setAppState] = useState('idle'); // idle, uploading, scanning, results, error
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

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
      
      // Upload to backend
      const response = await uploadMeal(selectedFile);
      
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
    <div className="app">
      <Header />
      
      <main className="main-content">
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
      </main>

      <footer className="footer">
        <p>Powered by Gemini AI • Made with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
