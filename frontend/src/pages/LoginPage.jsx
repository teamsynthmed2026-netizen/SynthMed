// LoginPage.jsx - User login form
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, AlertCircle, Loader2, LogIn } from 'lucide-react'
import { authAPI } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('All fields are required'); return }
    setLoading(true); setError('')

    try {
      const res = await authAPI.login(form)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--bg-primary)' }}>
      <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: '450px', padding: '3rem', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ color: 'var(--accent-blue)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Lock size={48} />
          </div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '700' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Sign in to your CureConnect account</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Email Address</label>
            <input id="email" type="email" name="email" placeholder="name@example.com"
              value={form.email} onChange={handleChange} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="form-group">
            <label htmlFor="password" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Password</label>
            <input id="password" type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem', fontWeight: '600', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} disabled={loading}>
            {loading ? <><Loader2 className="spinner-icon" size={20} /> Signing in...</> : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>

        <div className="divider" style={{ margin: '2rem 0', background: 'var(--border)' }}></div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.8rem' }}>
          New to CureConnect? <Link to="/register" style={{ color: 'var(--accent-blue)', fontWeight: '700', textDecoration: 'none' }}>Create an account →</Link>
        </p>
        <p style={{ textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
