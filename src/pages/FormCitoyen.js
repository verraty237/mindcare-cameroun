import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const regions = [
  'Adamaoua','Centre','Est','Extrême-Nord','Littoral',
  'Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'
];

const symptomesList = [
  { label: 'Anxiété', icon: '😰' },
  { label: 'Insomnie', icon: '😴' },
  { label: 'Fatigue chronique', icon: '😩' },
  { label: 'Tristesse profonde', icon: '😢' },
  { label: 'Irritabilité', icon: '😠' },
  { label: 'Manque de concentration', icon: '🧠' },
  { label: 'Isolement social', icon: '🚪' },
  { label: 'Pensées négatives', icon: '💭' },
  { label: 'Palpitations', icon: '💓' },
  { label: 'Maux de tête fréquents', icon: '🤕' },
];

const stressColors = ['#06d6a0','#06d6a0','#4cc9f0','#4cc9f0','#4361ee','#4361ee','#ffd166','#ffd166','#ef476f','#ef476f'];

export default function FormCitoyen() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [step, setStep] = useState(1);
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
    setSymptomes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        toast.success('📍 Position récupérée !');
      },
      () => toast.error('❌ Position indisponible.')
    );
  };

  const nextStep = () => {
    if (step === 1 && (!nom || !age || !sexe || !region)) {
      toast.error('⚠️ Remplissez tous les champs !');
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('citoyens').insert([{
      nom, age: Number(age), sexe, region,
      niveau_stress: stress,
      symptomes: symptomes.join(', '),
      latitude, longitude,
    }]);
    setLoading(false);
    if (error) toast.error('❌ Erreur : ' + error.message);
    else setSucces(true);
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '12px',
    background: isDark ? 'rgba(255,255,255,0.08)' : '#f8faff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
    color: isDark ? '#fff' : '#1a1a2e', fontSize: '1rem',
    boxSizing: 'border-box', outline: 'none', transition: 'all 0.3s',
    fontFamily: "'Segoe UI', sans-serif",
  };

  const labelStyle = {
    display: 'block', marginBottom: '8px', fontWeight: '700',
    fontSize: '0.9rem', color: isDark ? '#ccc' : '#444',
  };

  if (succes) return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? 'linear-gradient(135deg, #0a0a1a, #1a1a2e)' : 'linear-gradient(135deg, #f0f4ff, #e8f0fe)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className={`${isDark ? 'glass-dark' : 'glass-light'} animate-fadeInUp`}
        style={{ textAlign: 'center', padding: '60px 50px', maxWidth: '450px', borderRadius: '24px' }}>
        <div className="animate-float" style={{ fontSize: '5rem', marginBottom: '20px' }}>✅</div>
        <h2 style={{
          fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px',
          background: 'linear-gradient(135deg, #06d6a0, #4cc9f0)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Merci pour votre signalement !</h2>
        <p style={{ color: isDark ? '#888' : '#666', marginBottom: '8px', lineHeight: 1.6 }}>
          Vos données ont été enregistrées de façon anonyme et sécurisée.
        </p>
        <p style={{ color: isDark ? '#666' : '#999', fontSize: '0.85rem', marginBottom: '32px' }}>
          Elles contribuent à améliorer la santé mentale au Cameroun. 💚
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            🏠 Retour à l'accueil
          </button>
          <button onClick={() => { setSucces(false); setStep(1); setNom(''); setAge(''); setSexe(''); setRegion(''); setStress(5); setSymptomes([]); }}
            style={{
              padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600',
              background: 'transparent', border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
              color: isDark ? '#fff' : '#1a1a2e',
            }}>
            ➕ Nouveau signalement
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0a0a1a, #1a1a2e, #0f3460)'
        : 'linear-gradient(135deg, #f0f4ff, #e8f0fe)',
      paddingTop: '100px', padding: '100px 20px 40px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '2rem', fontWeight: '900', marginBottom: '8px',
            color: isDark ? '#fff' : '#1a1a2e',
          }}>🙋 Espace Citoyen</h1>
          <p style={{ color: isDark ? '#888' : '#666' }}>
            Signalement anonyme et sécurisé — Étape {step}/3
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '6px', borderRadius: '3px', marginBottom: '32px',
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}>
          <div style={{
            height: '100%', borderRadius: '3px', transition: 'width 0.5s ease',
            width: `${(step / 3) * 100}%`,
            background: 'linear-gradient(135deg, #4361ee, #f72585)',
          }} />
        </div>

        <div className={`${isDark ? 'glass-dark' : 'glass-light'}`}
          style={{ padding: '40px', borderRadius: '24px' }}>

          {/* ÉTAPE 1 — Infos personnelles */}
          {step === 1 && (
            <div className="animate-fadeInUp">
              <h2 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '24px', fontSize: '1.3rem' }}>
                👤 Informations personnelles
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Nom ou pseudonyme *</label>
                <input style={inputStyle} placeholder="Ex: Jean D. (ou un pseudonyme)"
                  value={nom} onChange={e => setNom(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Âge *</label>
                  <input style={inputStyle} type="number" placeholder="Ex: 25"
                    value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Sexe *</label>
                  <select style={inputStyle} value={sexe} onChange={e => setSexe(e.target.value)}>
                    <option value="">-- Choisir --</option>
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Région *</label>
                <select style={inputStyle} value={region} onChange={e => setRegion(e.target.value)}>
                  <option value="">-- Sélectionner votre région --</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <button className="btn-primary" onClick={nextStep}
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                Continuer → Étape 2
              </button>
            </div>
          )}

          {/* ÉTAPE 2 — Santé mentale */}
          {step === 2 && (
            <div className="animate-fadeInUp">
              <h2 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '24px', fontSize: '1.3rem' }}>
                🧠 Évaluation de la santé mentale
              </h2>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>
                  Niveau de stress actuel :
                  <span style={{
                    marginLeft: '10px', fontSize: '1.4rem', fontWeight: '900',
                    color: stressColors[stress - 1],
                  }}>{stress}/10</span>
                </label>
                <input type="range" min="1" max="10" value={stress}
                  onChange={e => setStress(Number(e.target.value))}
                  style={{ width: '100%', accentColor: stressColors[stress - 1], height: '6px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#06d6a0' }}>😊 Très faible</span>
                  <span style={{ fontSize: '0.8rem', color: '#ffd166' }}>😐 Modéré</span>
                  <span style={{ fontSize: '0.8rem', color: '#ef476f' }}>😰 Très élevé</span>
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>
                  Symptômes ressentis
                  <span style={{ color: '#4361ee', marginLeft: '8px', fontSize: '0.8rem' }}>
                    ({symptomes.length} sélectionné{symptomes.length > 1 ? 's' : ''})
                  </span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {symptomesList.map(s => {
                    const selected = symptomes.includes(s.label);
                    return (
                      <button key={s.label} type="button" onClick={() => toggleSymptome(s.label)}
                        style={{
                          padding: '12px', borderRadius: '12px', cursor: 'pointer',
                          fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.2s',
                          fontFamily: "'Segoe UI', sans-serif", fontWeight: '600',
                          background: selected ? 'rgba(67,97,238,0.2)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          border: selected ? '2px solid #4361ee' : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                          color: selected ? '#4361ee' : isDark ? '#ccc' : '#555',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                        {selected && <span style={{ marginLeft: 'auto' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  background: 'transparent', fontWeight: '600',
                  border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#ccc' : '#666',
                }}>← Retour</button>
                <button className="btn-primary" onClick={nextStep} style={{ flex: 2, padding: '14px' }}>
                  Continuer → Étape 3
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Géolocalisation + Confirmation */}
          {step === 3 && (
            <div className="animate-fadeInUp">
              <h2 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '24px', fontSize: '1.3rem' }}>
                📍 Localisation & Confirmation
              </h2>

              <div style={{
                padding: '20px', borderRadius: '16px', marginBottom: '24px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '16px', fontSize: '1rem' }}>
                  📋 Récapitulatif
                </h3>
                {[
                  { label: 'Nom', val: nom },
                  { label: 'Âge', val: `${age} ans` },
                  { label: 'Sexe', val: sexe },
                  { label: 'Région', val: region },
                  { label: 'Niveau de stress', val: `${stress}/10` },
                  { label: 'Symptômes', val: symptomes.length ? symptomes.join(', ') : 'Aucun' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '8px 0', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  }}>
                    <span style={{ color: isDark ? '#888' : '#999', fontSize: '0.85rem' }}>{item.label}</span>
                    <span style={{ color: isDark ? '#fff' : '#1a1a2e', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>

              <button type="button" onClick={getLocation} style={{
                width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                marginBottom: '16px', fontWeight: '700', fontSize: '0.95rem',
                background: latitude ? 'rgba(6,214,160,0.15)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `2px solid ${latitude ? '#06d6a0' : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                color: latitude ? '#06d6a0' : isDark ? '#ccc' : '#666',
              }}>
                {latitude ? `✅ Géolocalisé : ${latitude.toFixed(3)}, ${longitude.toFixed(3)}` : '📍 Activer la géolocalisation (optionnel)'}
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(2)} style={{
                  flex: 1, padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  background: 'transparent', fontWeight: '600',
                  border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#ccc' : '#666',
                }}>← Retour</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}
                  style={{ flex: 2, padding: '14px' }}>
                  {loading ? '⏳ Envoi...' : '📤 Soumettre mon signalement'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}