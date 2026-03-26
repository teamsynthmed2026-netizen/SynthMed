// RegisterPage.jsx - New user registration form
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  UserPlus, AlertCircle, CheckCircle, 
  Loader2, User, Activity 
} from 'lucide-react'
import { authAPI } from '../api/api'
import { useAuth } from '../context/AuthContext'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', age: '', blood_group: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')

    try {
      const res = await authAPI.register(form)
      setSuccess('Account created! Redirecting...')
      login(res.data.user, res.data.token)
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', background: 'var(--bg-primary)' }}>
      <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: '500px', padding: '3rem', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ color: 'var(--accent-blue)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <UserPlus size={48} />
          </div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '700' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Join CureConnect for personalized healthcare</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18} /> {error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem', background: 'rgba(5, 150, 105, 0.08)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Full Name *</label>
            <input type="text" name="name" placeholder="Enter your full name" value={form.name} onChange={handleChange} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Email Address *</label>
            <input type="email" name="email" placeholder="name@example.com" value={form.email} onChange={handleChange} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Password * (min 6 chars)</label>
            <input type="password" name="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          {/* Optional health fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Phone (optional)</label>
              <input type="tel" name="phone" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={handleChange} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Age (optional)</label>
              <input type="number" name="age" placeholder="Age" min="1" max="120" value={form.age} onChange={handleChange} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Blood Group (optional)</label>
            <select name="blood_group" value={form.blood_group} onChange={handleChange} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <option value="">Select blood group</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem', fontWeight: '600', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} disabled={loading}>
            {loading ? <><Loader2 className="spinner-icon" size={20} /> Creating account...</> : <><Activity size={20} /> Create Account</>}
          </button>
        </form>

        <div className="divider" style={{ margin: '2.5rem 0', background: 'var(--border)' }}></div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: '700', textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
