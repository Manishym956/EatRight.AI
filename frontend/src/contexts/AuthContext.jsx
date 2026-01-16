import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authStatus, setAuthStatus] = useState(null); // 'signing_in', 'waking_server', 'error'
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // Check for token in URL (from OAuth redirect)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');

        if (urlToken) {
            setToken(urlToken);
            localStorage.setItem('token', urlToken);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (token) {
            try {
                // Determine user info from token (if JWT contains it) or fetch profile
                const decoded = jwtDecode(token);
                // For now, we'll fetch the full profile from the backend
                fetchUserProfile(token);
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUserProfile = async (authToken) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            if (error.name === 'AbortError') {
                console.warn('User profile fetch timed out');
            }
        } finally {
            setLoading(false);
        }
    };

    const checkBackendHealth = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const startTime = Date.now();
            const response = await fetch(`${API_BASE_URL}/health`, {
                signal: controller.signal
            });
            const responseTime = Date.now() - startTime;

            clearTimeout(timeoutId);

            if (response.ok) {
                // If response is slow, backend might be cold starting
                if (responseTime > 2000) {
                    setAuthStatus('waking_server');
                    return true;
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Health check failed:', error);
            // Backend might be cold, still try OAuth
            setAuthStatus('waking_server');
            return true;
        }
    };

    const login = async () => {
        try {
            setAuthStatus('signing_in');
            setAuthError(null);

            // Check backend health first
            await checkBackendHealth();

            // Small delay to show status
            await new Promise(resolve => setTimeout(resolve, 500));

            // Redirect to Google Auth
            window.location.href = `${API_BASE_URL}/auth/google`;
        } catch (error) {
            console.error('Login error:', error);
            setAuthError('Failed to connect to authentication server. Please try again.');
            setAuthStatus('error');
        }
    };

    const retryLogin = () => {
        setAuthError(null);
        setAuthStatus(null);
        login();
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setAuthStatus(null);
        setAuthError(null);
        localStorage.removeItem('token');
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            token,
            authStatus,
            authError,
            retryLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
