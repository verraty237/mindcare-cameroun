import React, { useEffect, useState, useContext } from 'react';
import { } from 'react-router-dom';
import { ThemeContext } from '../App';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
PieChart, Pie, Cell, AreaChart, Area,
RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const COLORS = ['#4361ee','#f72585','#4cc9f0','#7b2d8b','#06d6a0','#ffd166','#ef476f','#3a0ca3'];

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: isDark ? '#1a1a2e' : '#fff',
        border: '1px solid rgba(67,97,238,0.3)',
        borderRadius: '12px', padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <p style={{ color: isDark ? '#ccc' : '#444', fontSize: '0.85rem', marginBottom: '4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: '700', fontSize: '1rem' }}>
            {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);
 // const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [citoyens, setCitoyens] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    const { data: c } = await supabase.from('citoyens').select('*').order('created_at', { ascending: false });
    const { data: a } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
    setCitoyens(c || []);
    setAgents(a || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Stats
  const totalCitoyens = citoyens.length;
  const totalAgents = agents.length;
  const moyenneStress = citoyens.length
    ? (citoyens.reduce((s, c) => s + Number(c.niveau_stress), 0) / citoyens.length).toFixed(1) : 0;
  const totalCas = agents.reduce((s, a) => s + Number(a.nb_cas || 0), 0);
  const regionsCount = [...new Set(citoyens.map(c => c.region))].length;

  // Stress par région
  const stressParRegion = Object.values(citoyens.reduce((acc, c) => {
    if (!c.region) return acc;
    if (!acc[c.region]) acc[c.region] = { region: c.region.substring(0, 10), total: 0, count: 0 };
    acc[c.region].total += Number(c.niveau_stress);
    acc[c.region].count += 1;
    return acc;
  }, {})).map(r => ({ region: r.region, stress: parseFloat((r.total / r.count).toFixed(1)) }));

  // Diagnostics
  const diagData = Object.values(agents.reduce((acc, a) => {
    if (!a.diagnostic) return acc;
    const key = a.diagnostic.substring(0, 18);
    if (!acc[key]) acc[key] = { name: key, value: 0 };
    acc[key].value += 1;
    return acc;
  }, {}));

  // Répartition sexe
  const sexeData = Object.values(citoyens.reduce((acc, c) => {
    if (!c.sexe) return acc;
    if (!acc[c.sexe]) acc[c.sexe] = { name: c.sexe, value: 0 };
    acc[c.sexe].value += 1;
    return acc;
  }, {}));

  // Tranche d'âge
  const trancheAge = citoyens.reduce((acc, c) => {
    const age = Number(c.age);
    let tranche = age < 18 ? '<18' : age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : age < 60 ? '45-59' : '60+';
    const found = acc.find(x => x.tranche === tranche);
    if (found) found.count += 1;
    else acc.push({ tranche, count: 1 });
    return acc;
  }, []);

  // Radar symptomes
  const symptomesCount = {};
  citoyens.forEach(c => {
    if (c.symptomes) c.symptomes.split(', ').forEach(s => {
      symptomesCount[s] = (symptomesCount[s] || 0) + 1;
    });
  });
  const radarData = Object.entries(symptomesCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([s, v]) => ({ symptome: s.substring(0, 12), count: v }));

  // Points carte
  const pointsCarte = [
    ...citoyens.filter(c => c.latitude).map(c => ({
      lat: c.latitude, lng: c.longitude, type: 'citoyen',
      label: `🙋 ${c.nom} | Stress: ${c.niveau_stress}/10 | ${c.region}`,
    })),
    ...agents.filter(a => a.latitude).map(a => ({
      lat: a.latitude, lng: a.longitude, type: 'agent',
      label: `👨‍⚕️ ${a.nom_agent} | ${a.diagnostic} | ${a.hopital}`,
    })),
  ];

  const exportCSV = (data, nom) => {
    if (!data.length) { toast.error('Aucune donnée à exporter !'); return; }
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${nom}_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success(`✅ Export ${nom} réussi !`);
  };

  const tabStyle = (tab) => ({
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.3s', border: 'none',
    background: activeTab === tab ? 'linear-gradient(135deg, #4361ee, #4cc9f0)' : 'transparent',
    color: activeTab === tab ? '#fff' : isDark ? '#888' : '#666',
  });

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: isDark ? '#0a0a1a' : '#f0f4ff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px',
    }}>
      <div className="spinner" style={{ width: '50px', height: '50px' }} />
      <p style={{ color: '#4361ee', fontWeight: '700' }}>Chargement des données...</p>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? 'linear-gradient(135deg, #0a0a1a, #1a1a2e)' : 'linear-gradient(135deg, #f0f4ff, #e8f0fe)',
      paddingTop: '80px', fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: isDark ? '#fff' : '#1a1a2e', marginBottom: '4px' }}>
              📊 Dashboard Analytics
            </h1>
            <p style={{ color: isDark ? '#888' : '#666', fontSize: '0.9rem' }}>
              Surveillance en temps réel • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchData} style={{
              padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
              background: 'rgba(67,97,238,0.15)', color: '#4361ee',
              border: '1px solid rgba(67,97,238,0.3)', fontSize: '0.85rem',
            }}>
              {refreshing ? '⏳' : '🔄'} Actualiser
            </button>
            <button onClick={() => exportCSV(citoyens, 'citoyens')} style={{
              padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
              background: 'rgba(6,214,160,0.15)', color: '#06d6a0',
              border: '1px solid rgba(6,214,160,0.3)', fontSize: '0.85rem',
            }}>📥 CSV Citoyens</button>
            <button onClick={() => exportCSV(agents, 'agents')} style={{
              padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
              background: 'rgba(247,37,133,0.15)', color: '#f72585',
              border: '1px solid rgba(247,37,133,0.3)', fontSize: '0.85rem',
            }}>📥 CSV Agents</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { icon: '🙋', val: totalCitoyens, label: 'Signalements citoyens', color: '#4cc9f0', sub: 'Total collecté' },
            { icon: '👨‍⚕️', val: totalAgents, label: 'Rapports médicaux', color: '#7b2d8b', sub: 'Agents actifs' },
            { icon: '😰', val: `${moyenneStress}/10`, label: 'Stress moyen', color: '#f72585', sub: 'Indice national' },
            { icon: '🏥', val: totalCas, label: 'Cas suivis', color: '#06d6a0', sub: 'Ce mois' },
            { icon: '🗺️', val: regionsCount, label: 'Régions', color: '#ffd166', sub: 'Sur 10 au total' },
          ].map((s, i) => (
            <div key={i} className={`${isDark ? 'glass-dark' : 'glass-light'} card-hover`}
              style={{ padding: '24px 20px', borderTop: `3px solid ${s.color}`, borderRadius: '16px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: s.color, marginBottom: '2px' }}>{s.val}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: isDark ? '#ccc' : '#444', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: isDark ? '#666' : '#999' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '24px',
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          padding: '6px', borderRadius: '14px', width: 'fit-content',
        }}>
          {[
            { id: 'overview', label: '📈 Vue générale' },
            { id: 'map', label: '🗺️ Carte' },
            { id: 'data', label: '📋 Données brutes' },
          ].map(tab => (
            <button key={tab.id} style={tabStyle(tab.id)} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>

              {/* Stress par région */}
              <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
                <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '6px', fontWeight: '800' }}>📈 Stress moyen par région</h3>
                <p style={{ color: isDark ? '#666' : '#999', fontSize: '0.8rem', marginBottom: '20px' }}>Indice de stress (1-10)</p>
                {stressParRegion.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stressParRegion} barSize={28}>
                      <XAxis dataKey="region" stroke={isDark ? '#555' : '#bbb'} fontSize={11} />
                      <YAxis stroke={isDark ? '#555' : '#bbb'} domain={[0, 10]} fontSize={11} />
                      <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      <Bar dataKey="stress" radius={[8, 8, 0, 0]}>
                        {stressParRegion.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Aucune donnée</p>}
              </div>

              {/* Diagnostics Pie */}
              <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
                <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '6px', fontWeight: '800' }}>🧬 Répartition des diagnostics</h3>
                <p style={{ color: isDark ? '#666' : '#999', fontSize: '0.8rem', marginBottom: '20px' }}>Par type de trouble</p>
                {diagData.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={diagData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={40}>
                        {diagData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      <Legend formatter={(v) => <span style={{ color: isDark ? '#ccc' : '#444', fontSize: '0.75rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Aucune donnée</p>}
              </div>

              {/* Tranche d'âge */}
              <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
                <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '6px', fontWeight: '800' }}>👥 Répartition par âge</h3>
                <p style={{ color: isDark ? '#666' : '#999', fontSize: '0.8rem', marginBottom: '20px' }}>Tranches d'âge des signalements</p>
                {trancheAge.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={trancheAge}>
                      <XAxis dataKey="tranche" stroke={isDark ? '#555' : '#bbb'} fontSize={11} />
                      <YAxis stroke={isDark ? '#555' : '#bbb'} fontSize={11} />
                      <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      <Area type="monotone" dataKey="count" stroke="#4361ee" fill="rgba(67,97,238,0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Aucune donnée</p>}
              </div>

              {/* Radar Symptômes */}
              <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
                <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '6px', fontWeight: '800' }}>🕸️ Top symptômes</h3>
                <p style={{ color: isDark ? '#666' : '#999', fontSize: '0.8rem', marginBottom: '20px' }}>Fréquence des symptômes signalés</p>
                {radarData.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={isDark ? '#333' : '#ddd'} />
                      <PolarAngleAxis dataKey="symptome" stroke={isDark ? '#888' : '#666'} fontSize={10} />
                      <Radar dataKey="count" stroke="#f72585" fill="rgba(247,37,133,0.2)" strokeWidth={2} />
                      <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Aucune donnée</p>}
              </div>
            </div>

            {/* Répartition sexe */}
            {sexeData.length > 0 && (
              <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
                <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', marginBottom: '20px', fontWeight: '800' }}>⚧ Répartition par sexe</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {sexeData.map((s, i) => (
                    <div key={i} style={{
                      flex: 1, minWidth: '120px', padding: '20px', borderRadius: '14px', textAlign: 'center',
                      background: `${COLORS[i]}22`, border: `2px solid ${COLORS[i]}44`,
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                        {s.name === 'Masculin' ? '👨' : s.name === 'Féminin' ? '👩' : '🧑'}
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '900', color: COLORS[i] }}>{s.value}</div>
                      <div style={{ fontSize: '0.85rem', color: isDark ? '#888' : '#666', fontWeight: '600' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: isDark ? '#555' : '#999' }}>
                        {totalCitoyens ? Math.round((s.value / totalCitoyens) * 100) : 0}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Carte */}
        {activeTab === 'map' && (
          <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', fontWeight: '800', marginBottom: '4px' }}>🗺️ Carte interactive du Cameroun</h3>
                <p style={{ color: isDark ? '#666' : '#999', fontSize: '0.8rem' }}>
                  {pointsCarte.length} point{pointsCarte.length > 1 ? 's' : ''} géolocalisé{pointsCarte.length > 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isDark ? '#ccc' : '#555' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4cc9f0', display: 'inline-block' }} />
                  Citoyens
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isDark ? '#ccc' : '#555' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f72585', display: 'inline-block' }} />
                  Agents
                </span>
              </div>
            </div>
            <MapContainer center={[4.0, 12.0]} zoom={6} style={{ height: '500px', borderRadius: '16px' }}>
              <TileLayer
                url={isDark
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                attribution="© OpenStreetMap"
              />
              {pointsCarte.map((p, i) => (
                <React.Fragment key={i}>
                  <Marker position={[p.lat, p.lng]}>
                    <Popup>
                      <div style={{ fontFamily: 'Segoe UI', fontSize: '0.85rem' }}>
                        {p.label}
                      </div>
                    </Popup>
                  </Marker>
                  <Circle center={[p.lat, p.lng]} radius={15000}
                    pathOptions={{
                      color: p.type === 'citoyen' ? '#4cc9f0' : '#f72585',
                      fillColor: p.type === 'citoyen' ? '#4cc9f0' : '#f72585',
                      fillOpacity: 0.1,
                    }} />
                </React.Fragment>
              ))}
            </MapContainer>
            {pointsCarte.length === 0 && (
              <p style={{ color: '#666', textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
                💡 Soumettez des formulaires avec la géolocalisation activée pour voir les points sur la carte.
              </p>
            )}
          </div>
        )}

        {/* TAB: Données brutes */}
        {activeTab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Table citoyens */}
            <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
              <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', fontWeight: '800', marginBottom: '20px' }}>
                🙋 Signalements citoyens ({totalCitoyens})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      {['Nom', 'Âge', 'Sexe', 'Région', 'Stress', 'Symptômes'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: 'left', fontWeight: '700',
                          color: isDark ? '#888' : '#666', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {citoyens.slice(0, 10).map((c, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                        <td style={{ padding: '12px 16px', color: isDark ? '#fff' : '#1a1a2e', fontWeight: '600' }}>{c.nom}</td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#ccc' : '#555' }}>{c.age}</td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#ccc' : '#555' }}>{c.sexe}</td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#ccc' : '#555' }}>{c.region}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem',
                            background: c.niveau_stress >= 7 ? 'rgba(239,71,111,0.15)' : c.niveau_stress >= 4 ? 'rgba(255,209,102,0.15)' : 'rgba(6,214,160,0.15)',
                            color: c.niveau_stress >= 7 ? '#ef476f' : c.niveau_stress >= 4 ? '#ffd166' : '#06d6a0',
                          }}>
                            {c.niveau_stress}/10
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#888' : '#999', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.symptomes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {citoyens.length > 10 && (
                  <p style={{ color: '#4361ee', fontSize: '0.8rem', marginTop: '12px', textAlign: 'center' }}>
                    + {citoyens.length - 10} autres entrées — Exportez le CSV pour tout voir
                  </p>
                )}
              </div>
            </div>

            {/* Table agents */}
            <div className={`${isDark ? 'glass-dark' : 'glass-light'}`} style={{ padding: '28px', borderRadius: '20px' }}>
              <h3 style={{ color: isDark ? '#fff' : '#1a1a2e', fontWeight: '800', marginBottom: '20px' }}>
                👨‍⚕️ Rapports agents ({totalAgents})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      {['Agent', 'Établissement', 'Région', 'Diagnostic', 'Traitement', 'Cas'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: 'left', fontWeight: '700',
                          color: isDark ? '#888' : '#666', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agents.slice(0, 10).map((a, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                        <td style={{ padding: '12px 16px', color: isDark ? '#fff' : '#1a1a2e', fontWeight: '600' }}>{a.nom_agent}</td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#ccc' : '#555' }}>{a.hopital}</td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#ccc' : '#555' }}>{a.region}</td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#ccc' : '#555' }}>{a.diagnostic}</td>
                        <td style={{ padding: '12px 16px', color: isDark ? '#888' : '#999' }}>{a.traitement || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem',
                            background: 'rgba(67,97,238,0.15)', color: '#4361ee',
                          }}>{a.nb_cas}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {agents.length > 10 && (
                  <p style={{ color: '#4361ee', fontSize: '0.8rem', marginTop: '12px', textAlign: 'center' }}>
                    + {agents.length - 10} autres entrées — Exportez le CSV pour tout voir
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}