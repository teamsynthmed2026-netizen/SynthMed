// AppointmentPage.jsx - Book appointments with n8n webhook confirmation
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { appointmentsAPI, doctorsAPI } from '../api/api'

const today = new Date().toISOString().split('T')[0]
const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']
const statusColor = { pending: '#d97706', confirmed: '#059669', cancelled: '#dc2626', completed: '#2563eb' }

export default function AppointmentPage() {
  const location = useLocation()
  const preselectedDoctor = location.state?.doctor

  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({
    doctor_id: preselectedDoctor?.id || '',
    appointment_date: '', appointment_time: '', reason: '', notes: ''
  })
  const [activeTab, setActiveTab ] = useState('book')
  const [loading, setLoading] = useState(false)
  const [bookingResult, setBookingResult] = useState(null) // holds success result with n8n payload
  const [error, setError] = useState('')
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [docRes, apptRes] = await Promise.allSettled([doctorsAPI.getAll(), appointmentsAPI.getMy()])
      if (docRes.status === 'fulfilled') setDoctors(docRes.value.data.doctors || [])
      if (apptRes.status === 'fulfilled') setAppointments(apptRes.value.data.appointments || [])
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.doctor_id || !form.appointment_date || !form.appointment_time) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true); setError('')
    try {
      const res = await appointmentsAPI.book(form)
      setBookingResult(res.data)           // store full response including webhook payload
      // Refresh list
      const apptRes = await appointmentsAPI.getMy()
      setAppointments(apptRes.data.appointments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await appointmentsAPI.cancel(id)
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
    } catch { alert('Could not cancel.') }
  }

  // ---- BOOKING SUCCESS VIEW ----
  if (bookingResult) {
    const appt = bookingResult.appointment
    const payload = bookingResult.webhook_payload
    return (
      <div className="page" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>

            {/* Success card */}
            <div className="glass-card animate-fadeInUp" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem', borderColor: 'rgba(5, 150, 105, 0.2)', background: 'white', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
              <h2 style={{ color: '#059669', marginBottom: '1rem', fontSize: '1.75rem' }}>Appointment Confirmed!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>{bookingResult.message}</p>

              {/* Appointment Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
                {[
                  { label: '👨‍⚕️ Doctor', value: appt?.doctor_name },
                  { label: '🏥 Specialty', value: appt?.doctor_specialty },
                  { label: '📅 Date', value: new Date(appt?.appointment_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: '🕐 Time', value: appt?.appointment_time },
                  { label: '🏨 Health Center', value: appt?.hospital || 'CureConnect Partner' },
                  { label: '📌 Status', value: 'Confirmed' }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* n8n notification */}
              {bookingResult.n8n_notified && (
                <div className="alert alert-success" style={{ justifyContent: 'center', marginBottom: 0, background: 'rgba(5, 150, 105, 0.08)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                  ⚡ AI Scheduling automation successful via n8n
                </div>
              )}
            </div>

            {/* Payload Viewer */}
            <div className="glass-card animate-fadeInUp" style={{ marginBottom: '2rem', background: 'white', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem', fontSize: '1.1rem' }}>📋 Technical Details</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Webhook data processed by n8n</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowJson(!showJson)} style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
                  {showJson ? 'Hide ▲' : 'View Payload ▼'}
                </button>
              </div>

              {showJson && (
                <div style={{ marginTop: '1.5rem' }}>
                  <pre style={{
                    background: '#f8fafc', borderRadius: '12px', padding: '1.5rem',
                    overflowX: 'auto', fontSize: '0.8rem', lineHeight: '1.6',
                    color: '#334155', border: '1px solid var(--border)',
                    maxHeight: '400px', overflowY: 'auto', fontFamily: 'monospace'
                  }}>
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', paddingBottom: '3rem' }}>
              <button className="btn btn-secondary" onClick={() => { setBookingResult(null); setActiveTab('my') }}>View My Schedule</button>
              <button className="btn btn-primary" onClick={() => { setBookingResult(null); setForm({ doctor_id: '', appointment_date: '', appointment_time: '', reason: '', notes: '' }) }}>Book New Appointment</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="page-header">
          <h1 style={{ color: 'var(--text-primary)' }}>📅 Appointments</h1>
          <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>Book and manage your specialist appointments</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem' }}>
          {['book', 'my'].map(tab => (
            <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab)} style={{ padding: '0.6rem 1.75rem', fontSize: '0.95rem', borderRadius: '10px' }}>
              {tab === 'book' ? '📅 Schedule New' : `📋 My Appointments (${appointments.length})`}
            </button>
          ))}
        </div>

        {/* ---- BOOK TAB ---- */}
        {activeTab === 'book' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', paddingBottom: '4rem' }}>
            {preselectedDoctor && (
              <div className="alert alert-info" style={{ marginBottom: '1.5rem', background: 'rgba(0, 102, 255, 0.08)', color: 'var(--accent-blue)', border: '1px solid rgba(0, 102, 255, 0.2)' }}>
                📌 You are booking with: <strong>{preselectedDoctor.name}</strong> — {preselectedDoctor.specialty}
              </div>
            )}
            {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' }}>⚠️ {error}</div>}

            <form className="glass-card animate-fadeInUp" onSubmit={handleSubmit} style={{ background: 'white', padding: '2.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginBottom: '2rem', color: 'var(--text-primary)', fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Booking Information</h3>

              <div className="form-group">
                <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Select Specialist *</label>
                <select value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <option value="">-- Choose a doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty} ({d.city})</option>)}
                  {doctors.length === 0 && preselectedDoctor && (
                    <option value={preselectedDoctor.id}>{preselectedDoctor.name} — {preselectedDoctor.specialty}</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Preferred Date *</label>
                  <input type="date" min={today} value={form.appointment_date}
                    onChange={e => setForm({ ...form, appointment_date: e.target.value })} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Available Slot *</label>
                  <select value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} required style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    <option value="">Select time</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Reason for Visit</label>
                <input type="text" placeholder="e.g. Regular checkup, specific symptoms..."
                  value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Additional Notes</label>
                <textarea rows={4} placeholder="Any specific information or medical history to share..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}></textarea>
              </div>

              {/* n8n info */}
              <div style={{ padding: '1rem', background: 'rgba(0, 102, 255, 0.05)', border: '1px solid rgba(0, 102, 255, 0.1)', borderRadius: '10px', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <p style={{ margin: 0 }}>This booking will be prioritized and synced with our <strong>AI Schedule Manager (n8n)</strong>.</p>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem', fontWeight: '600', borderRadius: '12px' }} disabled={loading}>
                {loading ? '⏳ Processing Request...' : '📅 Confirm Booking'}
              </button>
            </form>
          </div>
        )}

        {/* ---- MY APPOINTMENTS TAB ---- */}
        {activeTab === 'my' && (
          <div style={{ paddingBottom: '4rem' }}>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '20px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📅</div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>You have no scheduled appointments</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Schedule your first visit with one of our expert specialists.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('book')} style={{ marginTop: '2rem', padding: '0.8rem 2rem' }}>Book Now</button>
              </div>
            ) : (
              <div className="grid-2">
                {appointments.map(appt => (
                  <div key={appt.id} className="glass-card animate-fadeInUp" style={{ background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem', fontSize: '1.2rem', fontWeight: '650' }}>{appt.doctor_name}</h4>
                        <span style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: '600', background: 'rgba(0, 102, 255, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{appt.doctor_specialty}</span>
                      </div>
                      <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', background: `${statusColor[appt.status]}15`, color: statusColor[appt.status], border: `1px solid ${statusColor[appt.status]}30` }}>
                        {appt.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ opacity: 0.6 }}>📅</span> {new Date(appt.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ opacity: 0.6 }}>🕐</span> {appt.appointment_time}
                      </div>
                      {appt.hospital && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                          <span style={{ opacity: 0.6 }}>🏥</span> {appt.hospital}
                        </div>
                      )}
                      {appt.reason && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic', gridColumn: 'span 2', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                          " {appt.reason} "
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                       {appt.n8n_sent ? (
                          <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1rem' }}>⚡</span> AI Synced
                          </span>
                       ) : <span></span>}
                      {appt.status === 'pending' && (
                        <button className="btn btn-secondary" onClick={() => handleCancel(appt.id)} style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
