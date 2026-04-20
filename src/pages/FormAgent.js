import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function FormAgent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);
  const [form, setForm] = useState({
    nom_agent: '', hopital: '', region: '',
    diagnostic: '', traitement: '', nb_cas: '',
    latitude: null, longitude: null,
  });

  const regions = [
    'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
    'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
  ];

  const diagnostics = [
    'Stress aigu', 'Dépression légère', 'Dépression modérée',
    'Dépression sévère', 'Burnout professionnel', 'Trouble anxieux généralisé',
    'Trouble de panique', 'Trouble bipolaire', 'Schizophrénie', 'Autre'
  ];

  const traitements = [
    'Psychothérapie', 'Médicaments antidépresseurs', 'Anxiolytiques',
    'Suivi psychiatrique', 'Thérapie de groupe', 'Hospitalisation',
    'Suivi ambulatoire', 'Référence spécialiste'
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm({
        ...form,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      alert('📍 Position récupérée avec succès !');
    }, () => alert('❌ Impossible de récupérer la position.'));
  };

  const handleSubmit = async () => {
    if (!form.nom_agent || !form.hopital || !form.region || !form.diagnostic || !form.nb_cas) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires !');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('agents').insert([{ ...form }]);
    setLoading(false);
    if (error) {
      alert('❌ Erreur : ' + error.message);
    } else {
      setSucces(true);
    }
  };

  if (succes) return (
    <div style={styles.succes}>
      <div style={styles.succesBox}>
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2 style={{ color: '#7b2d8b' }}>Données enregistrées !</h2>
        <p style={{ color: '#ccc' }}>Le cas a été soumis avec succès.</p>
        <button style={styles.btnRetour} onClick={() => navigate('/')}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.titre}>👨‍⚕️ Formulaire Agent de Santé</h1>
        <p style={styles.sousTitre}>Enregistrement des cas cliniques</p>

        <div style={styles.group}>
          <label style={styles.label}>Nom de l'agent *</label>
          <input style={styles.input} name="nom_agent"
            placeholder="Dr. Mballa Jean" value={form.nom_agent} onChange={handleChange} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Établissement de santé *</label>
          <input style={styles.input} name="hopital"
            placeholder="Centre Hospitalier de Yaoundé" value={form.hopital} onChange={handleChange} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Région *</label>
          <select style={styles.input} name="region" value={form.region} onChange={handleChange}>
            <option value="">-- Sélectionner la région --</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Diagnostic principal *</label>
          <select style={styles.input} name="diagnostic" value={form.diagnostic} onChange={handleChange}>
            <option value="">-- Sélectionner le diagnostic --</option>
            {diagnostics.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Traitement prescrit</label>
          <select style={styles.input} name="traitement" value={form.traitement} onChange={handleChange}>
            <option value="">-- Sélectionner le traitement --</option>
            {traitements.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Nombre de cas suivis ce mois *</label>
          <input style={styles.input} name="nb_cas" type="number"
            placeholder="Ex: 12" value={form.nb_cas} onChange={handleChange} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>📍 Géolocalisation de l'établissement</label>
          <button style={styles.btnGeo} onClick={getLocation}>
            📍 Récupérer la position automatiquement
          </button>
          {form.latitude && (
            <p style={{ color: '#7b2d8b', fontSize: '0.85rem', marginTop: '5px' }}>
              ✅ Position : {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
            </p>
          )}
        </div>

        <button style={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Envoi en cours...' : '📤 Soumettre le cas'}
        </button>

        <button style={styles.btnBack} onClick={() => navigate('/')}>
          ← Retour
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif",
  },
  formBox: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '20px',
    padding: '40px', width: '100%', maxWidth: '650px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  titre: { color: '#fff', fontSize: '2rem', marginBottom: '5px' },
  sousTitre: { color: '#c77dff', marginBottom: '30px' },
  group: { marginBottom: '20px' },
  label: { color: '#ccc', display: 'block', marginBottom: '8px', fontSize: '0.95rem' },
  input: {
    width: '100%', padding: '12px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: '1rem', boxSizing: 'border-box',
  },
  btnGeo: {
    background: 'rgba(123,45,139,0.2)', color: '#c77dff',
    border: '1px solid #7b2d8b', padding: '10px 20px',
    borderRadius: '10px', cursor: 'pointer', width: '100%',
  },
  btnSubmit: {
    background: 'linear-gradient(135deg, #7b2d8b, #f72585)',
    color: '#fff', border: 'none', padding: '15px',
    borderRadius: '12px', cursor: 'pointer', width: '100%',
    fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px',
  },
  btnBack: {
    background: 'transparent', color: '#888', border: 'none',
    cursor: 'pointer', width: '100%', padding: '10px',
  },
  succes: {
    minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  succesBox: {
    textAlign: 'center', background: 'rgba(255,255,255,0.05)',
    padding: '50px', borderRadius: '20px',
  },
  btnRetour: {
    marginTop: '20px', background: '#7b2d8b', color: '#fff',
    border: 'none', padding: '12px 30px', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 'bold',
  },
};