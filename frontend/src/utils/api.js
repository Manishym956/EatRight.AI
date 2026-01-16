/**
 * API service for backend communication
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// Import compression utility
import { compressImage } from './imageUtils';

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. The server might be waking up, please try again.');
        }
        throw error;
    }
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 2, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Upload a meal image for AI analysis
 * @param {File} file - The image file to upload
 * @param {string} token - Optional auth token
 * @returns {Promise<Object>} Analysis results
 */
export async function uploadMeal(file, token = null) {
    try {
        console.log(`Original file size: ${(file.size / 1024).toFixed(1)}KB`);

        // Compress image before upload (reduces upload time significantly)
        let fileToUpload = file;
        if (file.size > 500 * 1024) { // Only compress if larger than 500KB
            try {
                fileToUpload = await compressImage(file, 1024, 1024, 0.85);
            } catch (compressionError) {
                console.warn('Image compression failed, uploading original:', compressionError);
                fileToUpload = file;
            }
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Use retry logic with timeout
        const response = await retryWithBackoff(async () => {
            return await fetchWithTimeout(`${API_BASE_URL}/upload-meal`, {
                method: 'POST',
                body: formData,
                headers: headers
            }, 30000); // 30 second timeout
        }, 2, 1000); // Max 2 retries with 1s base delay

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Unable to connect to server. Please check your internet connection.');
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
