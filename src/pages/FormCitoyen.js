import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const regions = [
  'Adamaoua','Centre','Est','Extrême-Nord','Littoral',
  'Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'
];

const symptomesList = [
  'Anxiété','Insomnie','Fatigue chronique','Tristesse profonde',
  'Irritabilité','Manque de concentration','Isolement social',
  'Pensées négatives','Palpitations','Maux de tête fréquents'
];

export default function FormCitoyen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);
  const [nom, setNom] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [region, setRegion] = useState('');
  const [stress, setStress] = useState(5);
  const [symptomes, setSymptomes] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const toggleSymptome = (s) => {
    setSymptomes(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        alert('📍 Position récupérée !');
      },
      () => alert('❌ Position indisponible.')
    );
  };

  const handleSubmit = async () => {
    if (!nom || !age || !sexe || !region) {
      alert('⚠️ Remplissez tous les champs obligatoires !');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('citoyens').insert([{
      nom, age: Number(age), sexe, region,
      niveau_stress: stress,
      symptomes: symptomes.join(', '),
      latitude, longitude,
    }]);
    setLoading(false);
    if (error) alert('❌ Erreur : ' + error.message);
    else setSucces(true);
  };

  if (succes) return (
    <div style={styles.succes}>
      <div style={styles.succesBox}>
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2 style={{ color: '#4cc9f0' }}>Merci pour votre signalement !</h2>
        <p style={{ color: '#ccc' }}>Données enregistrées anonymement.</p>
        <button style={styles.btnRetour} onClick={() => navigate('/')}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.titre}>🙋 Formulaire Citoyen</h1>
        <p style={styles.sousTitre}>Vos données sont anonymes et sécurisées</p>

        <div style={styles.group}>
          <label style={styles.label}>Nom (ou pseudonyme) *</label>
          <input style={styles.input} placeholder="Ex: Jean D."
            value={nom} onChange={e => setNom(e.target.value)} />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.group, flex: 1 }}>
            <label style={styles.label}>Âge *</label>
            <input style={styles.input} type="number" placeholder="Ex: 25"
              value={age} onChange={e => setAge(e.target.value)} />
          </div>
          <div style={{ ...styles.group, flex: 1 }}>
            <label style={styles.label}>Sexe *</label>
            <select style={styles.input} value={sexe} onChange={e => setSexe(e.target.value)}>
              <option value="">-- Choisir --</option>
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Région *</label>
          <select style={styles.input} value={region} onChange={e => setRegion(e.target.value)}>
            <option value="">-- Sélectionner --</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>
            Niveau de stress : <strong style={{ color: '#4cc9f0' }}>{stress}/10</strong>
          </label>
          <input type="range" min="1" max="10"
            value={stress} onChange={e => setStress(Number(e.target.value))}
            style={{ width: '100%' }} />
          <div style={styles.rangeLabels}>
            <span>😊 Faible</span>
            <span>😰 Très élevé</span>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Symptômes ressentis</label>
          <div style={styles.checkGrid}>
            {symptomesList.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptome(s)}
                style={{
                  ...styles.checkItem,
                  background: symptomes.includes(s) ? '#4cc9f0' : 'rgba(255,255,255,0.05)',
                  color: symptomes.includes(s) ? '#000' : '#ccc',
                  border: symptomes.includes(s) ? '2px solid #4cc9f0' : '2px solid transparent',
                }}
              >
                {symptomes.includes(s) ? '✅ ' : ''}{s}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>📍 Géolocalisation (optionnel)</label>
          <button type="button" style={styles.btnGeo} onClick={getLocation}>
            📍 Récupérer ma position
          </button>
          {latitude && (
            <p style={{ color: '#4cc9f0', fontSize: '0.85rem', marginTop: '5px' }}>
              ✅ {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>

        <button type="button" style={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Envoi...' : '📤 Soumettre mon signalement'}
        </button>

        <button type="button" style={styles.btnBack} onClick={() => navigate('/')}>
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
  sousTitre: { color: '#a0c4ff', marginBottom: '30px' },
  group: { marginBottom: '20px' },
  row: { display: 'flex', gap: '15px' },
  label: { color: '#ccc', display: 'block', marginBottom: '8px', fontSize: '0.95rem' },
  input: {
    width: '100%', padding: '12px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: '1rem', boxSizing: 'border-box',
  },
  rangeLabels: { display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.8rem' },
  checkGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  checkItem: {
    padding: '10px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.85rem', textAlign: 'center', transition: 'all 0.2s',
    fontFamily: "'Segoe UI', sans-serif",
  },
  btnGeo: {
    background: 'rgba(76,201,240,0.2)', color: '#4cc9f0',
    border: '1px solid #4cc9f0', padding: '10px 20px',
    borderRadius: '10px', cursor: 'pointer', width: '100%',
  },
  btnSubmit: {
    background: 'linear-gradient(135deg, #4cc9f0, #7b2d8b)',
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
    marginTop: '20px', background: '#4cc9f0', color: '#000',
    border: 'none', padding: '12px 30px', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 'bold',
  },
};