import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Accueil from './pages/Accueil';
import FormCitoyen from './pages/FormCitoyen';
import FormAgent from './pages/FormAgent';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

export const ThemeContext = createContext();
export const AuthContext = createContext();

function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  return (
    <nav className={`navbar ${theme}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => navigate('/')}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #4361ee, #f72585)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px'
        }}>🧠</div>
        <div>
          <div style={{
            fontWeight: '800', fontSize: '1rem',
            color: theme === 'dark' ? '#fff' : '#1a1a2e'
          }}>MindCare</div>
          <div style={{ fontSize: '0.65rem', color: '#4361ee', fontWeight: '600' }}>CAMEROUN</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '20px',
            background: 'rgba(67,97,238,0.15)',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4361ee, #f72585)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', color: 'white', fontWeight: 'bold'
            }}>
              {user.nom?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#fff' : '#1a1a2e', fontWeight: '600' }}>
              {user.nom}
            </span>
            <span className="badge badge-primary">{user.role}</span>
          </div>
        )}

        <button onClick={toggleTheme} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px', padding: '8px 12px', cursor: 'pointer',
          fontSize: '1.1rem', transition: 'all 0.3s',
          color: theme === 'dark' ? '#fff' : '#1a1a2e',
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user ? (
          <button onClick={logout} style={{
            background: 'rgba(239,71,111,0.15)', color: '#ef476f',
            border: '1px solid rgba(239,71,111,0.3)', padding: '8px 16px',
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
          }}>Déconnexion</button>
        ) : (
          <button onClick={() => navigate('/login')} className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Connexion
          </button>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.body.className = theme;
    const saved = localStorage.getItem('mindcare_theme');
    if (saved) { setTheme(saved); document.body.className = saved; }
    const savedUser = localStorage.getItem('mindcare_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('mindcare_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('mindcare_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindcare_user');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <Router>
          <Navbar />
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: theme === 'dark' ? '#1a1a2e' : '#fff',
              color: theme === 'dark' ? '#fff' : '#1a1a2e',
              border: '1px solid rgba(67,97,238,0.3)',
            }
          }} />
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/login" element={<Login />} />
            <Route path="/citoyen" element={<FormCitoyen />} />
            <Route path="/agent" element={<FormAgent />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}