import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, AuthContext } from '../App';
import toast from 'react-hot-toast';

const USERS = [
  { id: 1, nom: 'Admin MindCare', email: 'admin@mindcare.cm', password: 'admin123', role: 'Admin' },
  { id: 2, nom: 'Dr. Mballa', email: 'agent@mindcare.cm', password: 'agent123', role: 'Agent' },
  { id: 3, nom: 'Citoyen', email: 'citoyen@mindcare.cm', password: 'citoyen123', role: 'Citoyen' },
];

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs !');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const found = USERS.find(u => u.email === email && u.password === password);
    setLoading(false);
    if (found) {
      login(found);
      toast.success(`Bienvenue ${found.nom} ! 👋`);
      if (found.role === 'Agent') navigate('/agent');
      else if (found.role === 'Admin') navigate('/dashboard');
      else navigate('/citoyen');
    } else {
      toast.error('Email ou mot de passe incorrect !');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #dce8ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '10%', left: '10%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(67,97,238,0.15), transparent)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '10%', width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(247,37,133,0.1), transparent)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '440px',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '24px', padding: '48px 40px',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #4361ee, #f72585)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', margin: '0 auto 16px',
            boxShadow: '0 8px 25px rgba(67,97,238,0.4)',
          }}>🧠</div>
          <h1 style={{
            fontSize: '1.8rem', fontWeight: '800',
            background: 'linear-gradient(135deg, #4361ee, #f72585)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
          }}>MindCare Cameroun</h1>
          <p style={{ color: isDark ? '#888' : '#666', fontSize: '0.9rem' }}>
            Plateforme de santé mentale communautaire
          </p>
        </div>

        {/* Comptes de démo */}
        <div style={{
          background: isDark ? 'rgba(67,97,238,0.1)' : 'rgba(67,97,238,0.05)',
          border: '1px solid rgba(67,97,238,0.2)',
          borderRadius: '12px', padding: '14px', marginBottom: '24px',
        }}>
          <p style={{ color: '#4361ee', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>
            🔑 Comptes de démonstration :
          </p>
          {USERS.map(u => (
            <div key={u.id} onClick={() => { setEmail(u.email); setPassword(u.password); }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.2s',
                background: email === u.email ? 'rgba(67,97,238,0.15)' : 'transparent',
              }}>
              <span style={{ color: isDark ? '#ccc' : '#444', fontSize: '0.8rem' }}>
                {u.role} — {u.email}
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {u.password}
              </span>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem',
            color: isDark ? '#ccc' : '#444',
          }}>📧 Email</label>
          <input
            className="input-pro"
            type="email"
            placeholder="votre@email.cm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : '#f8faff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
              color: isDark ? '#fff' : '#1a1a2e',
            }}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem',
            color: isDark ? '#ccc' : '#444',
          }}>🔒 Mot de passe</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input-pro"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : '#f8faff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#fff' : '#1a1a2e',
                paddingRight: '48px',
              }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
            }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              Connexion...
            </span>
          ) : '🚀 Se connecter'}
        </button>

        <p style={{
          textAlign: 'center', marginTop: '20px', fontSize: '0.8rem',
          color: isDark ? '#666' : '#999',
        }}>
          Pas de compte ? Continuez en tant que{' '}
          <span onClick={() => navigate('/citoyen')} style={{
            color: '#4361ee', cursor: 'pointer', fontWeight: '600',
          }}>Citoyen anonyme</span>
        </p>
      </div>
    </div>
  );
}