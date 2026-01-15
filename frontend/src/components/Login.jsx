import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
    const { login } = useAuth();

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

                <button className="google-btn" onClick={login}>
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google logo"
                        className="google-icon"
                    />
                    <span>Continue with Google</span>
                </button>
            </div>
        </div>
    );
}

export default Login;
