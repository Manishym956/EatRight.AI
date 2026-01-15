import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import MealHistory from './components/MealHistory';
import CalorieTracker from './components/CalorieTracker';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <MealHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <CalorieTracker />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        <p>Powered by Gemini AI • Made with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
