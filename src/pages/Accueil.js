import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, AuthContext } from '../App';
import { supabase } from '../supabaseClient';

export default function Accueil() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({ citoyens: 0, agents: 0, cas: 0, regions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: c } = await supabase.from('citoyens').select('region');
      const { data: a } = await supabase.from('agents').select('nb_cas');
      const regions = [...new Set((c || []).map(x => x.region))].length;
      const totalCas = (a || []).reduce((s, x) => s + Number(x.nb_cas || 0), 0);
      setStats({ citoyens: c?.length || 0, agents: a?.length || 0, cas: totalCas, regions });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    {
      icon: '🙋', titre: 'Espace Citoyen',
      desc: 'Signalez vos symptômes de stress, anxiété ou burnout de façon anonyme et sécurisée.',
      color: '#4cc9f0', path: '/citoyen',
      badge: 'Anonyme & Gratuit', btnText: 'Accéder →',
      roles: ['Citoyen', null],
    },
    {
      icon: '👨‍⚕️', titre: 'Espace Agent de Santé',
      desc: 'Enregistrez vos diagnostics cliniques et suivez l\'évolution des cas dans votre région.',
      color: '#7b2d8b', path: '/agent',
      badge: 'Réservé aux professionnels', btnText: 'Accéder →',
      roles: ['Agent', 'Admin'],
    },
    {
      icon: '📊', titre: 'Dashboard Analytics',
      desc: 'Visualisez les données en temps réel avec des graphiques avancés et la carte interactive.',
      color: '#f72585', path: '/dashboard',
      badge: 'Temps réel', btnText: 'Voir le dashboard →',
      roles: ['Admin', 'Agent', 'Citoyen', null],
    },
  ];

  const statsData = [
    { icon: '🙋', val: loading ? '...' : stats.citoyens, label: 'Signalements', color: '#4cc9f0' },
    { icon: '👨‍⚕️', val: loading ? '...' : stats.agents, label: 'Rapports médicaux', color: '#7b2d8b' },
    { icon: '🏥', val: loading ? '...' : stats.cas, label: 'Cas suivis', color: '#f72585' },
    { icon: '🗺️', val: loading ? '...' : stats.regions, label: 'Régions couvertes', color: '#06d6a0' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      paddingTop: '80px',
    }}>
      {/* Orbs décoratifs */}
      {[
        { top: '5%', left: '5%', color: 'rgba(67,97,238,0.15)', size: '400px' },
        { top: '60%', right: '5%', color: 'rgba(247,37,133,0.1)', size: '300px' },
        { bottom: '10%', left: '30%', color: 'rgba(76,201,240,0.08)', size: '250px' },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'fixed', width: orb.size, height: orb.size,
          background: `radial-gradient(circle, ${orb.color}, transparent)`,
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-fadeInUp">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(67,97,238,0.15)', border: '1px solid rgba(67,97,238,0.3)',
            borderRadius: '20px', padding: '6px 16px', marginBottom: '24px',
          }}>
            <span style={{ color: '#4361ee', fontSize: '0.8rem', fontWeight: '700' }}>
              🌍 CAMEROUN — AFRIQUE CENTRALE
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900',
            lineHeight: 1.1, marginBottom: '20px',
            color: isDark ? '#fff' : '#1a1a2e',
          }}>
            La santé mentale,{' '}
            <span className="gradient-text">notre priorité</span>
            <br />collective
          </h1>

          <p style={{
            fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 36px',
            color: isDark ? '#a0a0b8' : '#555', lineHeight: 1.7,
          }}>
            Plateforme intelligente de surveillance et de collecte de données
            sur la santé mentale au Cameroun. Anonyme, sécurisée et gratuite.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!user ? (
              <>
                <button className="btn-primary animate-glow"
                  onClick={() => navigate('/login')}
                  style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '14px' }}>
                  🚀 Commencer maintenant
                </button>
                <button onClick={() => navigate('/citoyen')} style={{
                  padding: '14px 32px', fontSize: '1rem', borderRadius: '14px',
                  background: 'transparent', cursor: 'pointer', fontWeight: '600',
                  border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                  color: isDark ? '#fff' : '#1a1a2e', transition: 'all 0.3s',
                }}>
                  Accès anonyme →
                </button>
              </>
            ) : (
              <div style={{
                padding: '14px 28px', borderRadius: '14px',
                background: 'rgba(6,214,160,0.15)', border: '1px solid rgba(6,214,160,0.3)',
                color: '#06d6a0', fontWeight: '700',
              }}>
                👋 Bienvenue, {user.nom} !
              </div>
            )}
          </div>
        </div>

        {/* Stats en temps réel */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px', marginBottom: '60px',
        }}>
          {statsData.map((s, i) => (
            <div key={i} className={`card-hover ${isDark ? 'glass-dark' : 'glass-light'}`}
              style={{ padding: '24px', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{
                fontSize: '2.2rem', fontWeight: '800', color: s.color, marginBottom: '4px',
              }}>
                {loading ? (
                  <div className="animate-pulse" style={{ color: s.color }}>...</div>
                ) : s.val}
              </div>
              <div style={{ fontSize: '0.85rem', color: isDark ? '#888' : '#666', fontWeight: '600' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Cards principales */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px', marginBottom: '60px',
        }}>
          {cards.map((card, i) => (
            <div key={i}
              className={`card-hover ${isDark ? 'glass-dark' : 'glass-light'}`}
              onClick={() => navigate(card.path)}
              style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>

              {/* Glow bg */}
              <div style={{
                position: 'absolute', top: '-30px', right: '-30px',
                width: '120px', height: '120px',
                background: `radial-gradient(circle, ${card.color}22, transparent)`,
                borderRadius: '50%',
              }} />

              <div style={{
                width: '60px', height: '60px', borderRadius: '16px', marginBottom: '20px',
                background: `linear-gradient(135deg, ${card.color}33, ${card.color}11)`,
                border: `1px solid ${card.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
              }}>
                {card.icon}
              </div>

              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                background: `${card.color}22`, color: card.color,
                fontSize: '0.72rem', fontWeight: '700', marginBottom: '14px',
                border: `1px solid ${card.color}44`,
              }}>
                {card.badge}
              </div>

              <h3 style={{
                fontSize: '1.3rem', fontWeight: '800', marginBottom: '12px',
                color: isDark ? '#fff' : '#1a1a2e',
              }}>{card.titre}</h3>

              <p style={{
                fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px',
                color: isDark ? '#a0a0b8' : '#666',
              }}>{card.desc}</p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                color: card.color, fontWeight: '700', fontSize: '0.95rem',
              }}>
                {card.btnText}
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', padding: '30px 0',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🧠</span>
            <span style={{ fontWeight: '800', color: isDark ? '#fff' : '#1a1a2e' }}>MindCare Cameroun</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: isDark ? '#555' : '#999' }}>
            © 2025 MindCare Cameroun — Plateforme de surveillance communautaire de la santé mentale
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
            {['🔒 Données sécurisées', '🌍 10 Régions couvertes', '💚 100% Gratuit'].map((t, i) => (
              <span key={i} style={{ fontSize: '0.75rem', color: isDark ? '#666' : '#aaa' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}