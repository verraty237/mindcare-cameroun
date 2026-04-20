import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const COLORS = ['#4cc9f0', '#7b2d8b', '#f72585', '#4361ee', '#3a0ca3', '#560bad'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [citoyens, setCitoyens] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: c } = await supabase.from('citoyens').select('*');
      const { data: a } = await supabase.from('agents').select('*');
      setCitoyens(c || []);
      setAgents(a || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Stats
  const totalCitoyens = citoyens.length;
  const totalAgents = agents.length;
  const moyenneStress = citoyens.length
    ? (citoyens.reduce((s, c) => s + Number(c.niveau_stress), 0) / citoyens.length).toFixed(1)
    : 0;
  const totalCas = agents.reduce((s, a) => s + Number(a.nb_cas || 0), 0);

  // Données graphique stress par région
  const stressParRegion = citoyens.reduce((acc, c) => {
    if (!acc[c.region]) acc[c.region] = { region: c.region, total: 0, count: 0 };
    acc[c.region].total += Number(c.niveau_stress);
    acc[c.region].count += 1;
    return acc;
  }, {});
  const stressData = Object.values(stressParRegion).map(r => ({
    region: r.region?.substring(0, 8),
    stress: (r.total / r.count).toFixed(1),
  }));

  // Données graphique diagnostics
  const diagData = agents.reduce((acc, a) => {
    const found = acc.find(x => x.name === a.diagnostic);
    if (found) found.value += 1;
    else acc.push({ name: a.diagnostic, value: 1 });
    return acc;
  }, []);

  // Points carte
  const pointsCarte = [
    ...citoyens.filter(c => c.latitude).map(c => ({
      lat: c.latitude, lng: c.longitude,
      label: `🙋 ${c.nom} — Stress: ${c.niveau_stress}/10`,
      type: 'citoyen'
    })),
    ...agents.filter(a => a.latitude).map(a => ({
      lat: a.latitude, lng: a.longitude,
      label: `👨‍⚕️ ${a.nom_agent} — ${a.diagnostic}`,
      type: 'agent'
    })),
  ];

  const exportCSV = (data, nom) => {
    if (!data.length) return alert('Aucune donnée à exporter !');
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${nom}.csv`; a.click();
  };

  if (loading) return (
    <div style={styles.loading}>
      <div style={{ fontSize: '3rem' }}>⏳</div>
      <p style={{ color: '#4cc9f0' }}>Chargement des données...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.btnBack} onClick={() => navigate('/')}>← Retour</button>
        <h1 style={styles.titre}>📊 Dashboard MindCare Cameroun</h1>
        <p style={styles.sousTitre}>Surveillance en temps réel de la santé mentale</p>
      </div>

      {/* Cartes stats */}
      <div style={styles.statsGrid}>
        {[
          { icon: '🙋', val: totalCitoyens, label: 'Signalements citoyens', color: '#4cc9f0' },
          { icon: '👨‍⚕️', val: totalAgents, label: 'Rapports agents', color: '#7b2d8b' },
          { icon: '😰', val: `${moyenneStress}/10`, label: 'Stress moyen', color: '#f72585' },
          { icon: '🏥', val: totalCas, label: 'Cas totaux suivis', color: '#4361ee' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
            <div style={{ ...styles.statVal, color: s.color }}>{s.val}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitre}>📈 Stress moyen par région</h3>
          {stressData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stressData}>
                <XAxis dataKey="region" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" domain={[0, 10]} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', color: '#fff' }} />
                <Bar dataKey="stress" fill="#4cc9f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={styles.noData}>Aucune donnée disponible</p>}
        </div>

        <div style={styles.chartBox}>
          <h3 style={styles.chartTitre}>🧬 Répartition des diagnostics</h3>
          {diagData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={diagData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} label={({ name }) => name?.substring(0, 10)}>
                  {diagData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={styles.noData}>Aucune donnée disponible</p>}
        </div>
      </div>

      {/* Carte interactive */}
      <div style={styles.mapBox}>
        <h3 style={styles.chartTitre}>🗺️ Carte des signalements au Cameroun</h3>
        <MapContainer center={[4.0, 12.0]} zoom={6}
          style={{ height: '450px', borderRadius: '12px' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
          {pointsCarte.map((p, i) => (
            <Marker key={i} position={[p.lat, p.lng]}>
              <Popup>{p.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
        {pointsCarte.length === 0 && (
          <p style={styles.noData}>
            Aucun point géolocalisé — soumettez des formulaires avec la position activée
          </p>
        )}
      </div>

      {/* Export CSV */}
      <div style={styles.exportBox}>
        <h3 style={styles.chartTitre}>📥 Exporter les données pour EC2</h3>
        <div style={styles.exportBtns}>
          <button style={styles.btnExport} onClick={() => exportCSV(citoyens, 'citoyens_mindcare')}>
            📥 Export Citoyens CSV
          </button>
          <button style={{ ...styles.btnExport, background: '#7b2d8b' }}
            onClick={() => exportCSV(agents, 'agents_mindcare')}>
            📥 Export Agents CSV
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    padding: '30px 20px', fontFamily: "'Segoe UI', sans-serif",
  },
  loading: {
    minHeight: '100vh', background: '#1a1a2e',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  btnBack: {
    background: 'transparent', color: '#888', border: '1px solid #444',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px',
  },
  titre: { color: '#fff', fontSize: '2rem', margin: '0 0 5px' },
  sousTitre: { color: '#a0c4ff' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px', marginBottom: '30px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '15px',
    padding: '25px', textAlign: 'center',
  },
  statVal: { fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0' },
  statLabel: { color: '#888', fontSize: '0.9rem' },
  chartsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px', marginBottom: '30px',
  },
  chartBox: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '25px',
  },
  chartTitre: { color: '#fff', marginBottom: '15px', fontSize: '1rem' },
  noData: { color: '#666', textAlign: 'center', padding: '30px' },
  mapBox: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '15px',
    padding: '25px', marginBottom: '30px',
  },
  exportBox: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '25px',
  },
  exportBtns: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  btnExport: {
    background: '#4cc9f0', color: '#000', border: 'none',
    padding: '12px 25px', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 'bold',
  },
};