/**
 * API service for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Upload a meal image for AI analysis
 * @param {File} file - The image file to upload
 * @param {string} token - Optional auth token
 * @returns {Promise<Object>} Analysis results
 */
export async function uploadMeal(file, token = null) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/upload-meal`, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Unable to connect to server. Please ensure the backend is running.');
        }
        throw error;
    }
}

/**
 * Get meal history for user
 * @param {string} token - Auth token
 * @returns {Promise<Array>} List of meals
 */
export async function getMealHistory(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/meals/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    } catch (error) {
        console.error('History API Error:', error);
        throw error;
    }
}

/**
 * Get calorie stats for user
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Stats
 */
export async function getMealStats(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/meals/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error('Stats API Error:', error);
        throw error;
    }
}

export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) throw new Error('Health check failed');
        return await response.json();
    } catch (error) {
        console.error('Health check error:', error);
        throw error;
    }
}
