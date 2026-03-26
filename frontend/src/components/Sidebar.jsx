// Sidebar.jsx - Modern vertical navigation and SOS integration
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, User, Search, Calendar, 
  Stethoscope, Ambulance, Activity, AlertTriangle 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showSos, setShowSos] = useState(false)

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <User size={20} />, label: 'Medical Profile', path: '/profile' },
    { icon: <Search size={20} />, label: 'Symptom Checker', path: '/symptoms' },
    { icon: <Calendar size={20} />, label: 'Appointments', path: '/appointments' },
    { icon: <Stethoscope size={20} />, label: 'Find Doctors', path: '/doctors' },
    { icon: <Ambulance size={20} />, label: 'First Aid', path: '/firstaid' },
  ]

  return (
    <>
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">
          <Activity size={24} style={{ marginRight: '0.75rem', color: 'var(--accent-blue)' }} /> CureConnect
        </Link>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" style={{ padding: '0 1rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <User size={20} color="var(--accent-blue)" />
             </div>
             <div style={{ overflow: 'hidden' }}>
               <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Patient ID: {user?.id?.slice(0,8)}</div>
             </div>
          </Link>
          
          <button className="sos-trigger" onClick={() => setShowSos(true)}>
            <AlertTriangle size={18} style={{ marginRight: '8px' }} /> CRITICAL SOS
          </button>
          
          <button 
            onClick={logout}
            style={{ 
              width: '100%', padding: '0.75rem', marginTop: '1rem', 
              background: 'transparent', border: '1px solid var(--border)', 
              borderRadius: '10px', color: 'var(--text-secondary)', 
              fontSize: '0.85rem', cursor: 'pointer' 
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* SOS MODAL */}
      <AnimatePresence>
        {showSos && (
          <motion.div 
            className="sos-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSos(false)}
          >
            <motion.div 
              className="sos-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚨</div>
              <h2 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem' }}>EMERGENCY HELP</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                You are about to trigger a critical response. 
                Please select an action below.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="tel:108" className="btn btn-primary" style={{ background: '#ef4444', padding: '1.25rem', fontSize: '1.2rem', fontWeight: '800' }}>
                   📞 Call Ambulance (108)
                </a>
                <button className="btn btn-secondary" style={{ padding: '1rem' }} onClick={() => alert('Location shared with emergency contacts!')}>
                   📍 Share Location with Family
                </button>
                <button className="btn btn-secondary" style={{ border: 'none', color: 'var(--text-muted)' }} onClick={() => setShowSos(false)}>
                   Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
