import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, AuthContext } from '../App';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const regions = [
  'Adamaoua','Centre','Est','Extrême-Nord','Littoral',
  'Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'
];

const diagnostics = [
  { label: 'Stress aigu', icon: '😰', severity: 'low' },
  { label: 'Dépression légère', icon: '😔', severity: 'low' },
  { label: 'Dépression modérée', icon: '😢', severity: 'medium' },
  { label: 'Dépression sévère', icon: '😞', severity: 'high' },
  { label: 'Burnout professionnel', icon: '🔥', severity: 'medium' },
  { label: 'Trouble anxieux généralisé', icon: '😨', severity: 'medium' },
  { label: 'Trouble de panique', icon: '💔', severity: 'high' },
  { label: 'Trouble bipolaire', icon: '🔄', severity: 'high' },
  { label: 'Schizophrénie', icon: '🧩', severity: 'high' },
  { label: 'Autre', icon: '📋', severity: 'low' },
];

const traitements = [
  'Psychothérapie', 'Médicaments antidépresseurs', 'Anxiolytiques',
  'Suivi psychiatrique', 'Thérapie de groupe', 'Hospitalisation',
  'Suivi ambulatoire', 'Référence spécialiste',
];

const severityColors = { low: '#06d6a0', medium: '#ffd166', high: '#ef476f' };

export default function FormAgent() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);
  const [nomAgent, setNomAgent] = useState(user?.nom || '');
  const [hopital, setHopital] = useState('');
  const [region, setRegion] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [traitement, setTraitement] = useState('');
  const [nbCas, setNbCas] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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
    if (step === 1 && (!nomAgent || !hopital || !region)) {
      toast.error('⚠️ Remplissez tous les champs !');
      return;
    }
    if (step === 2 && (!diagnostic || !nbCas)) {
      toast.error('⚠️ Sélectionnez un diagnostic et le nombre de cas !');
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('agents').insert([{
      nom_agent: nomAgent, hopital, region,
      diagnostic, traitement, nb_cas: Number(nbCas),
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
          background: 'linear-gradient(135deg, #7b2d8b, #f72585)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Rapport enregistré !</h2>
        <p style={{ color: isDark ? '#888' : '#666', marginBottom: '32px', lineHeight: 1.6 }}>
          Les données cliniques ont été soumises avec succès et contribuent à la surveillance nationale.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            📊 Voir le dashboard
          </button>
          <button onClick={() => { setSucces(false); setStep(1); setHopital(''); setRegion(''); setDiagnostic(''); setTraitement(''); setNbCas(''); }}
            style={{
              padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600',
              background: 'transparent', border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
              color: isDark ? '#fff' : '#1a1a2e',
            }}>
            ➕ Nouveau rapport
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
          }}>👨‍⚕️ Espace Agent de Santé</h1>
          <p style={{ color: isDark ? '#888' : '#666' }}>
            Enregistrement clinique sécurisé — Étape {step}/3
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
            background: 'linear-gradient(135deg, #7b2d8b, #f72585)',
          }} />
        </div>

        <div className={`${isDark ? 'glass-dark' : 'glass-light'}`}
          style={{ padding: '40px', borderRadius: '24px' }}>

          {/* ÉTAPE 1 — Infos agent */}
          {step === 1 && (
            <div className="animate-fadeInUp">
              <h2 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '24px', fontSize: '1.3rem' }}>
                🏥 Informations de l'établissement
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Nom de l'agent de santé *</label>
                <input style={inputStyle} placeholder="Dr. Mballa Jean"
                  value={nomAgent} onChange={e => setNomAgent(e.target.value)} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Établissement de santé *</label>
                <input style={inputStyle} placeholder="Centre Hospitalier de Yaoundé"
                  value={hopital} onChange={e => setHopital(e.target.value)} />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Région *</label>
                <select style={inputStyle} value={region} onChange={e => setRegion(e.target.value)}>
                  <option value="">-- Sélectionner la région --</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <button className="btn-primary" onClick={nextStep}
                style={{ width: '100%', padding: '14px', fontSize: '1rem',
                  background: 'linear-gradient(135deg, #7b2d8b, #f72585)' }}>
                Continuer → Étape 2
              </button>
            </div>
          )}

          {/* ÉTAPE 2 — Diagnostic */}
          {step === 2 && (
            <div className="animate-fadeInUp">
              <h2 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '24px', fontSize: '1.3rem' }}>
                🧬 Diagnostic & Traitement
              </h2>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Diagnostic principal *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {diagnostics.map(d => {
                    const selected = diagnostic === d.label;
                    const color = severityColors[d.severity];
                    return (
                      <button key={d.label} type="button" onClick={() => setDiagnostic(d.label)}
                        style={{
                          padding: '12px', borderRadius: '12px', cursor: 'pointer',
                          fontSize: '0.82rem', textAlign: 'left', transition: 'all 0.2s',
                          fontFamily: "'Segoe UI', sans-serif", fontWeight: '600',
                          background: selected ? `${color}22` : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          border: selected ? `2px solid ${color}` : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                          color: selected ? color : isDark ? '#ccc' : '#555',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                        <span>{d.icon}</span>
                        <span>{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Traitement prescrit</label>
                <select style={inputStyle} value={traitement} onChange={e => setTraitement(e.target.value)}>
                  <option value="">-- Sélectionner --</option>
                  {traitements.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Nombre de cas suivis ce mois *</label>
                <input style={inputStyle} type="number" placeholder="Ex: 12"
                  value={nbCas} onChange={e => setNbCas(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  background: 'transparent', fontWeight: '600',
                  border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#ccc' : '#666',
                }}>← Retour</button>
                <button onClick={nextStep} style={{
                  flex: 2, padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '1rem', color: '#fff', border: 'none',
                  background: 'linear-gradient(135deg, #7b2d8b, #f72585)',
                }}>
                  Continuer → Étape 3
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Confirmation */}
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
                  📋 Récapitulatif du rapport
                </h3>
                {[
                  { label: 'Agent', val: nomAgent },
                  { label: 'Établissement', val: hopital },
                  { label: 'Région', val: region },
                  { label: 'Diagnostic', val: diagnostic },
                  { label: 'Traitement', val: traitement || 'Non spécifié' },
                  { label: 'Nombre de cas', val: `${nbCas} cas` },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  }}>
                    <span style={{ color: isDark ? '#888' : '#999', fontSize: '0.85rem' }}>{item.label}</span>
                    <span style={{ color: isDark ? '#fff' : '#1a1a2e', fontSize: '0.85rem', fontWeight: '600' }}>
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
                <button onClick={handleSubmit} disabled={loading} style={{
                  flex: 2, padding: '14px', borderRadius: '12px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '1rem', color: '#fff', border: 'none',
                  background: 'linear-gradient(135deg, #7b2d8b, #f72585)',
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? '⏳ Envoi...' : '📤 Soumettre le rapport'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}