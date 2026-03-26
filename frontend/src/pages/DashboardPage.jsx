// DashboardPage.jsx - Authenticated user dashboard with health charts
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { 
  TrendingUp, Search, Stethoscope, Microscope, 
  Calendar, AlertTriangle, Sparkles, Activity 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { symptomsAPI, appointmentsAPI } from '../api/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [histRes, apptRes] = await Promise.allSettled([
          symptomsAPI.getHistory(),
          appointmentsAPI.getMy()
        ])
        if (histRes.status === 'fulfilled') setHistory(histRes.value.data.history || [])
        if (apptRes.status === 'fulfilled') setAppointments(apptRes.value.data.appointments || [])
      } catch (err) { console.log('Dashboard load error:', err) }
      finally { setLoading(false) }
    }
    loadData()
  }, [])

  // Prepare chart data
  const riskValue = { critical: 4, high: 3, medium: 2, low: 1 }
  const chartData = history.slice(0, 7).reverse().map(item => ({
    date: new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    risk: riskValue[item.risk_level] || 0,
    level: item.risk_level
  }))

  const timeOfDay = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page" style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '2rem' }}>
      <div className="container">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {timeOfDay()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Your health status is looking stable today.</p>
        </motion.div>

        {/* Features Row - Visual Highlight */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Health Trend Chart Card */}
          <div className="glass-card" style={{ background: 'white', padding: '2rem', gridColumn: 'span 2' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} color="var(--accent-blue)" /> Symptom Risk Trend
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 7 checks</span>
             </div>
             <div style={{ width: '100%', height: '240px' }}>
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                      <YAxis hide domain={[0, 4]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)' }}
                        formatter={(value, name, props) => [props.payload.level.toUpperCase(), 'Risk Level']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="risk" 
                        stroke="var(--accent-blue)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRisk)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Insufficient data for trends. Minimum 2 checks required.
                  </div>
                )}
             </div>
          </div>

          {/* Quick Actions Integration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {[
                { icon: <Search size={22} />, title: 'Check Symptoms', desc: 'AI Risk Assessment', link: '/symptoms', color: 'var(--accent-blue)' },
                { icon: <Stethoscope size={22} />, title: 'Find Doctors', desc: 'Book Specialists', link: '/doctors', color: '#0d9488' }
             ].map((action, i) => (
                <Link key={i} to={action.link} className="glass-card" style={{ textDecoration: 'none', display: 'flex', gap: '1rem', background: 'white', padding: '1.5rem', transition: 'all 0.2s ease', border: '1px solid var(--border)' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{action.icon}</div>
                   <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{action.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{action.desc}</p>
                   </div>
                </Link>
             ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          {[
            { label: 'Symptom History', value: history.length, icon: <Microscope size={24} />, color: 'var(--accent-blue)' },
            { label: 'Total Visits', value: appointments.length, icon: <Calendar size={24} />, color: '#8b5cf6' },
            { label: 'Active Alerts', value: history.filter(h => h.risk_level === 'critical').length, icon: <AlertTriangle size={24} />, color: '#ef4444' },
            { label: 'Medical Score', value: '92/100', icon: <Sparkles size={24} />, color: '#10b981' }
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ background: 'white', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ color: stat.color, marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>{stat.label}</div>
              <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '60px', height: '60px', background: stat.color, opacity: 0.05, borderRadius: '50%' }}></div>
            </div>
          ))}
        </div>

        {/* Activity & Schedule */}
        <div className="grid-2">
          {/* Recent History */}
          <div className="glass-card" style={{ background: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--accent-blue)" /> Activity Log
            </h3>
            {loading ? <div className="spinner" style={{ margin: '2rem auto' }}></div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {history.slice(0, 3).map(check => (
                    <div key={check.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ 
                             fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '4px',
                             background: check.risk_level === 'critical' ? '#fee2e2' : check.risk_level === 'high' ? '#ffedd5' : '#f0fdf4',
                             color: check.risk_level === 'critical' ? '#ef4444' : check.risk_level === 'high' ? '#f59e0b' : '#10b981'
                          }}>
                             {check.risk_level?.toUpperCase()} RISK
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(check.created_at).toLocaleDateString()}</span>
                       </div>
                       <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Symptoms: {check.symptoms?.join(', ')}</p>
                    </div>
                  ))}
                  <Link to="/symptoms" style={{ textAlign: 'center', color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>View All Checks →</Link>
                </div>
              )}
          </div>

          {/* Upcoming Schedule */}
          <div className="glass-card" style={{ background: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--accent-blue)" /> Upcoming Visits
            </h3>
            {loading ? <div className="spinner" style={{ margin: '2rem auto' }}></div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {appointments.filter(a => a.status === 'pending').slice(0, 3).map(appt => (
                      <div key={appt.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                         <div style={{ textAlign: 'center', padding: '0.5rem', background: 'white', borderRadius: '10px', minWidth: '60px' }}>
                            <div style={{ color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: '700' }}>{new Date(appt.appointment_date).toLocaleDateString('en-IN', { month: 'short' })}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{new Date(appt.appointment_date).getDate()}</div>
                         </div>
                         <div style={{ flexGrow: 1 }}>
                            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{appt.doctor_name}</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{appt.doctor_specialty} • {appt.appointment_time}</p>
                         </div>
                      </div>
                   ))}
                   {appointments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', py: '2rem' }}>No pending visits</p>}
                   <Link to="/appointments" style={{ textAlign: 'center', color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>Manage Bookings →</Link>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
