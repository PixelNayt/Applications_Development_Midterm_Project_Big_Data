import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Gamepad2, TrendingUp, DollarSign, Activity, AlertCircle, Loader2, Moon, Sun, Monitor } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0); // Show progress for fetching ~16k rows
  const [error, setError] = useState(null);

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        setError(null);
        
        let allData = [];
        let hasMore = true;
        let start = 0;
        const limit = 1000; // standard PostgREST limit, we will iterate in 1000s
        
        while (hasMore) {
          const { data: chunk, error: dbError } = await supabase
            .from('Game_Sales_Data')
            .select('*')
            .range(start, start + limit - 1);
            
          if (dbError) throw dbError;
          
          if (chunk && chunk.length > 0) {
            allData = [...allData, ...chunk];
            setProgress(allData.length);
            
            if (chunk.length < limit) {
              hasMore = false;
            } else {
              start += limit;
            }
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          setData(allData);
        } else {
          setError("No data returned from Game_Sales_Data table.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const g = d.Genre ? String(d.Genre).trim() : '';
      const p = d.Platform ? String(d.Platform).trim() : '';
      
      return (selectedGenre === 'All' || g === selectedGenre) &&
             (selectedPlatform === 'All' || p === selectedPlatform);
    });
  }, [data, selectedGenre, selectedPlatform]);

  const totalRecords = filteredData.length;
  const totalGlobalSales = filteredData.reduce((acc, curr) => acc + parseFloat(curr.Global_Sales || 0), 0).toFixed(2);
  const avgSales = totalRecords > 0 ? (totalGlobalSales / totalRecords).toFixed(2) : 0;
  
  const maxSales = totalRecords > 0 
    ? Math.max(...filteredData.map(d => parseFloat(d.Global_Sales || 0))).toFixed(2) 
    : 0;

  const salesByYearRaw = filteredData.reduce((acc, curr) => {
    const y = String(curr.Year).trim();
    if (!y || y === 'N/A' || y === 'null' || y === 'undefined') return acc;
    acc[y] = (acc[y] || 0) + parseFloat(curr.Global_Sales || 0);
    return acc;
  }, {});
  
  const lineChartData = Object.keys(salesByYearRaw)
    .sort()
    .map(year => ({ name: year, sales: parseFloat(salesByYearRaw[year].toFixed(2)) }));

  const pieData = useMemo(() => {
    let na = 0, eu = 0, jp = 0, other = 0;
    filteredData.forEach(d => {
      na += parseFloat(d.NA_Sales || 0);
      eu += parseFloat(d.EU_Sales || 0);
      jp += parseFloat(d.JP_Sales || 0);
      other += parseFloat(d.Other_Sales || 0);
    });
    return [
      { name: 'North America', value: parseFloat(na.toFixed(2)) },
      { name: 'Europe', value: parseFloat(eu.toFixed(2)) },
      { name: 'Japan', value: parseFloat(jp.toFixed(2)) },
      { name: 'Other', value: parseFloat(other.toFixed(2)) }
    ];
  }, [filteredData]);
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  const publisherSales = filteredData.reduce((acc, curr) => {
    const pub = String(curr.Publisher).trim();
    if (!pub || pub === 'N/A' || pub === 'null') return acc;
    acc[pub] = (acc[pub] || 0) + parseFloat(curr.Global_Sales || 0);
    return acc;
  }, {});
  
  const barChartData = Object.keys(publisherSales)
    .map(pub => ({ name: pub, sales: parseFloat(publisherSales[pub].toFixed(2)) }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const topGamesData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => parseFloat(b.Global_Sales || 0) - parseFloat(a.Global_Sales || 0))
      .slice(0, 5)
      .map(g => ({
        name: String(g.Name).trim(),
        sales: parseFloat(parseFloat(g.Global_Sales || 0).toFixed(2)),
        platform: String(g.Platform || 'N/A').trim(),
        genre: String(g.Genre || 'N/A').trim(),
        rank: g.Rank,
      }));
  }, [filteredData]);

  const genres = ['All', ...new Set(data.map(d => String(d.Genre).trim()).filter(g => g && g !== 'N/A' && g !== 'undefined'))].sort();
  const platforms = ['All', ...new Set(data.map(d => String(d.Platform).trim()).filter(p => p && p !== 'N/A' && p !== 'undefined'))].sort();

  if (loading) {
    return (
      <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
        <h2 style={{ color: 'var(--text-main)' }}>Downloading all records... {progress} fetched</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {error && (
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent-warning)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-warning)' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <header>
        <h1>Game Sales Insights</h1>
        
        <div className="controls-section glass-panel">
          <div className="filter-group">
            <label>Theme</label>
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--select-bg)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setTheme('default')} 
                style={{ background: theme === 'default' ? 'var(--accent-primary)' : 'transparent', color: theme === 'default' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '0.4rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Default (Dark)"
              >
                <Monitor size={16} />
              </button>
              <button 
                onClick={() => setTheme('light')} 
                style={{ background: theme === 'light' ? 'var(--accent-primary)' : 'transparent', color: theme === 'light' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '0.4rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Light Mode"
              >
                <Sun size={16} />
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                style={{ background: theme === 'dark' ? 'var(--accent-primary)' : 'transparent', color: theme === 'dark' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '0.4rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Dark Mode"
              >
                <Moon size={16} />
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>Genre</label>
            <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Platform</label>
            <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon blue">
            <Gamepad2 size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Games</span>
            <span className="kpi-value">{totalRecords.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="kpi-card glass-panel">
          <div className="kpi-icon green">
            <DollarSign size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Sales (M)</span>
            <span className="kpi-value">${Number(totalGlobalSales).toLocaleString()}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon purple">
            <Activity size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Average Sales (M)</span>
            <span className="kpi-value">${avgSales}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon orange">
            <TrendingUp size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Max Sale (M)</span>
            <span className="kpi-value">${maxSales}</span>
          </div>
        </div>
      </section>

      <section className="charts-grid">
        <div className="glass-panel chart-container full-width">
          <div className="chart-header">
            <h2 className="chart-title">Global Sales Trend Over Time</h2>
            <p className="chart-subtitle">Annual performance based on filtered data (total volume)</p>
          </div>
          <div className="chart-wrapper">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" stroke="var(--chart-axis)" />
                  <YAxis stroke="var(--chart-axis)" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-main)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Line type="monotone" dataKey="sales" name="Sales (M)" stroke="var(--accent-primary)" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{color: '#94a3b8', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>No data available</div>
            )}
          </div>
        </div>

        <div className="glass-panel chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Market Share by Region</h2>
            <p className="chart-subtitle">Distribution of sales globally</p>
          </div>
          <div className="chart-wrapper">
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-main)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    formatter={(value) => [`$${value.toLocaleString()}M`, 'Sales']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: 'var(--chart-axis)', fontSize: '0.85rem' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{color: '#94a3b8', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>No data available</div>
            )}
          </div>
        </div>

        <div className="glass-panel chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Top 5 Publishers</h2>
            <p className="chart-subtitle">Leading publishers by volume</p>
          </div>
          <div className="chart-wrapper">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={barChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" stroke="var(--chart-axis)" />
                  <YAxis type="category" dataKey="name" stroke="var(--chart-axis)" width={110} tick={{ fontSize: 11, fill: 'var(--chart-tick)' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--kpi-icon-bg)' }}
                    contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-main)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Bar dataKey="sales" name="Sales (M)" fill="var(--accent-secondary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{color: '#94a3b8', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>No data available</div>
            )}
          </div>
        </div>

        <div className="glass-panel chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Top 5 Games (Graph)</h2>
            <p className="chart-subtitle">Leading games based on current filters</p>
          </div>
          <div className="chart-wrapper">
            {topGamesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topGamesData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--chart-axis)" tick={{ fontSize: 11 }} tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val} />
                  <YAxis stroke="var(--chart-axis)" />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--kpi-icon-bg)' }}
                    contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', borderRadius: '0.5rem', color: 'var(--text-main)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Bar dataKey="sales" name="Global Sales (M)" fill="var(--accent-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{color: '#94a3b8', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>No data available</div>
            )}
          </div>
        </div>

        <div className="glass-panel chart-container" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="chart-header" style={{ marginBottom: '1rem' }}>
            <h2 className="chart-title">Top 5 Games (Table)</h2>
            <p className="chart-subtitle">Detailed view of top performing games</p>
          </div>
          <div className="table-responsive" style={{ flexGrow: 1, overflowY: 'auto' }}>
            {topGamesData.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Platform</th>
                    <th>Genre</th>
                    <th style={{ textAlign: 'right' }}>Sales (M)</th>
                  </tr>
                </thead>
                <tbody>
                  {topGamesData.map((game, idx) => (
                    <tr key={idx}>
                      <td>#{idx + 1}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{game.name}</td>
                      <td>{game.platform}</td>
                      <td>{game.genre}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>${game.sales.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{color: '#94a3b8', display: 'flex', height: '100%', minHeight: '200px', alignItems: 'center', justifyContent: 'center'}}>No data available</div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
