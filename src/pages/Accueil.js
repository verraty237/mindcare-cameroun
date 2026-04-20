import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Accueil() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titre}>🧠 MindCare Cameroun</h1>
        <p style={styles.sousTitre}>
          Plateforme de surveillance communautaire de la santé mentale
        </p>
      </div>

      <div style={styles.cardsContainer}>
        <div style={styles.card} onClick={() => navigate('/citoyen')}>
          <div style={styles.cardIcon}>🙋</div>
          <h2 style={styles.cardTitre}>Je suis un Citoyen</h2>
          <p style={styles.cardDesc}>
            Signalez vos symptômes de stress, anxiété ou burnout anonymement
          </p>
          <button style={styles.btnCitoyen}>Remplir le formulaire</button>
        </div>

        <div style={styles.card} onClick={() => navigate('/agent')}>
          <div style={styles.cardIcon}>👨‍⚕️</div>
          <h2 style={styles.cardTitre}>Je suis un Agent de Santé</h2>
          <p style={styles.cardDesc}>
            Enregistrez vos diagnostics et cas suivis dans votre établissement
          </p>
          <button style={styles.btnAgent}>Accéder au formulaire</button>
        </div>

        <div style={styles.card} onClick={() => navigate('/dashboard')}>
          <div style={styles.cardIcon}>📊</div>
          <h2 style={styles.cardTitre}>Dashboard</h2>
          <p style={styles.cardDesc}>
            Visualisez les données et la carte des signalements en temps réel
          </p>
          <button style={styles.btnDashboard}>Voir le tableau de bord</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  titre: {
    color: '#e0e0e0',
    fontSize: '2.8rem',
    marginBottom: '10px',
  },
  sousTitre: {
    color: '#a0c4ff',
    fontSize: '1.1rem',
  },
  cardsContainer: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '40px 30px',
    width: '280px',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'transform 0.3s',
  },
  cardIcon: { fontSize: '3rem', marginBottom: '15px' },
  cardTitre: { color: '#ffffff', fontSize: '1.3rem', marginBottom: '10px' },
  cardDesc: { color: '#a0a0b0', fontSize: '0.9rem', marginBottom: '20px' },
  btnCitoyen: {
    background: '#4cc9f0', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
  },
  btnAgent: {
    background: '#7b2d8b', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
  },
  btnDashboard: {
    background: '#f72585', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
  },
};