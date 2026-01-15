/**
 * API service for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Upload a meal image for AI analysis
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Analysis results
 */
export async function uploadMeal(file) {
    try {
        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('file', file);

        // Make API request
        const response = await fetch(`${API_BASE_URL}/upload-meal`, {
            method: 'POST',
            body: formData,
        });

        // Check for errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || `Upload failed with status ${response.status}`
            );
        }

        // Parse and return response
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);

        // Provide user-friendly error messages
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Unable to connect to server. Please ensure the backend is running.');
        }

        throw error;
    }
}

/**
 * Check backend health status
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
            throw new Error('Health check failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Health check error:', error);
        throw error;
    }
}
