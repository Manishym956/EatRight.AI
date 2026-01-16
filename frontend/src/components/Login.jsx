import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
    const { login, authStatus, authError, retryLogin } = useAuth();

    const getStatusMessage = () => {
        switch (authStatus) {
            case 'signing_in':
                return {
                    icon: '🔄',
                    text: 'Connecting to authentication server...',
                    subtext: 'Please wait'
                };
            case 'waking_server':
                return {
                    icon: '⏳',
                    text: 'Waking up the server...',
                    subtext: 'This may take 10-30 seconds on first access'
                };
            case 'error':
                return {
                    icon: '❌',
                    text: authError || 'Authentication failed',
                    subtext: 'Please try again'
                };
            default:
                return null;
        }
    };

    const statusMessage = getStatusMessage();

    return (
        <div className="login-container">
            <div className="login-card glass">
                <div className="login-logo">
                    🥗
                </div>
                <h1>Welcome to EatRight</h1>
                <p>Your personal AI Nutrition Assistant</p>

                <div className="features-list">
                    <div className="feature-item">
                        <span className="icon">📸</span>
                        <span>Snap photos of your food</span>
                    </div>
                    <div className="feature-item">
                        <span className="icon">🤖</span>
                        <span>Get AI-powered analysis</span>
                    </div>
                    <div className="feature-item">
                        <span className="icon">📊</span>
                        <span>Track calories & macros</span>
                    </div>
                </div>

                {statusMessage ? (
                    <div className={`auth-status ${authStatus}`}>
                        <div className="status-icon">{statusMessage.icon}</div>
                        <div className="status-text">
                            <div className="status-main">{statusMessage.text}</div>
                            <div className="status-sub">{statusMessage.subtext}</div>
                        </div>
                        {authStatus === 'error' && (
                            <button className="retry-btn" onClick={retryLogin}>
                                Try Again
                            </button>
                        )}
                    </div>
                ) : (
                    <button className="google-btn" onClick={login}>
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google logo"
                            className="google-icon"
                        />
                        <span>Continue with Google</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default Login;
