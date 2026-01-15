import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="header-brand">
                    <h1 className="header-title">🍽️ EatRight</h1>
                </Link>

                <nav className="header-nav">
                    {user ? (
                        <>
                            <Link to="/" className="nav-link">Upload</Link>
                            <Link to="/history" className="nav-link">History</Link>
                            <Link to="/stats" className="nav-link">Stats</Link>
                            <div className="user-menu">
                                <span className="user-name">Hi, {user.name}</span>
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="login-link">Sign In</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
