// Navbar.jsx - Navigation bar component
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <Activity className="nav-logo-icon" size={24} />
          <span className="nav-logo-text">CureConnect</span>
        </Link>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>

          {isAuthenticated && (
            <>
              <li><Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
              <li><Link to="/appointments" className={isActive('/appointments')} onClick={() => setMenuOpen(false)}>Appointments</Link></li>
            </>
          )}
        </ul>

        {/* Auth Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip"><User size={16} style={{ marginRight: '4px' }} /> {user?.name?.split(' ')[0]}</span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  )
}
