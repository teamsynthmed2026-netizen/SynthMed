// DoctorsPage.jsx - Find and filter specialist doctors
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Stethoscope, Search, Building2, MapPin, 
  GraduationCap, Phone, Star, UserSearch, Calendar 
} from 'lucide-react'
import { doctorsAPI } from '../api/api'

const specialties = ['All', 'Cardiologist', 'Neurologist', 'General Physician', 'Pulmonologist', 'Dermatologist', 'Orthopedic Surgeon', 'Endocrinologist', 'Gastroenterologist']

const fallbackDoctors = [
  { id: '1', name: 'Dr. Priya Sharma', specialty: 'Cardiologist', qualification: 'MBBS, MD, DM Cardiology', hospital: 'Apollo Hospital', city: 'Chennai', phone: '+91-9876543210', rating: 4.8, experience_years: 15, consultation_fee: 800, available_days: ['Mon', 'Tue', 'Wed', 'Fri'] },
  { id: '2', name: 'Dr. Rajesh Kumar', specialty: 'Neurologist', qualification: 'MBBS, MD, DM Neurology', hospital: 'AIIMS Delhi', city: 'New Delhi', phone: '+91-9876543211', rating: 4.9, experience_years: 20, consultation_fee: 1000, available_days: ['Mon', 'Wed', 'Thu', 'Sat'] },
  { id: '3', name: 'Dr. Anita Patel', specialty: 'General Physician', qualification: 'MBBS, MD', hospital: 'City Hospital', city: 'Mumbai', phone: '+91-9876543212', rating: 4.6, experience_years: 10, consultation_fee: 500, available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: '4', name: 'Dr. Suresh Reddy', specialty: 'Pulmonologist', qualification: 'MBBS, MD, DNB', hospital: 'Yashoda Hospital', city: 'Hyderabad', phone: '+91-9876543213', rating: 4.7, experience_years: 12, consultation_fee: 700, available_days: ['Tue', 'Thu', 'Fri', 'Sat'] },
  { id: '5', name: 'Dr. Meera Nair', specialty: 'Dermatologist', qualification: 'MBBS, MD Dermatology', hospital: 'Fortis Hospital', city: 'Bangalore', phone: '+91-9876543214', rating: 4.5, experience_years: 8, consultation_fee: 600, available_days: ['Mon', 'Wed', 'Fri'] },
  { id: '6', name: 'Dr. Vikram Singh', specialty: 'Orthopedic Surgeon', qualification: 'MBBS, MS Orthopedics', hospital: 'Max Hospital', city: 'New Delhi', phone: '+91-9876543215', rating: 4.8, experience_years: 18, consultation_fee: 900, available_days: ['Mon', 'Tue', 'Thu', 'Sat'] }
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorsAPI.getAll()
        setDoctors(res.data.doctors?.length > 0 ? res.data.doctors : fallbackDoctors)
      } catch {
        setDoctors(fallbackDoctors)
      } finally { setLoading(false) }
    }
    fetchDoctors()
  }, [])

  const filtered = doctors.filter(d =>
    (filter === 'All' || d.specialty === filter) &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()) || d.city.toLowerCase().includes(search.toLowerCase()))
  )

  const renderStars = (rating) => {
    const full = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    return (
      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
        {[...Array(full)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" stroke="none" />)}
        {hasHalf && <Star size={14} fill="#fbbf24" stroke="none" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      </div>
    )
  }

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><div className="spinner"></div></div>

  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="page-header">
          <h1 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <UserSearch size={32} color="var(--accent-blue)" /> Find Specialist Doctors
          </h1>
          <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>Connect with experienced specialists matched to your health needs</p>
        </div>

        {/* Search + Filter Bar */}
        <div className="glass-card" style={{ marginBottom: '2.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', background: 'white', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <input type="text" placeholder="Search by name, city, or hospital..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
             <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
               <Search size={18} />
             </span>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ flex: '0 0 auto', minWidth: '200px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>{filtered.length} doctors available</span>
        </div>

        {/* Doctor Cards */}
        <div className="grid-2">
          {filtered.map(doctor => (
            <div key={doctor.id} className="glass-card animate-fadeInUp" style={{ padding: '1.75rem', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', transition: 'transform 0.2s ease' }}>
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Avatar */}
                <div style={{
                  width: '70px', height: '70px', borderRadius: '16px', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent-blue), #5eafff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.6rem', fontWeight: '700', boxShadow: '0 4px 10px rgba(0, 102, 255, 0.2)'
                }}>
                  {doctor.name.split(' ').slice(-1)[0][0]}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.4rem', fontSize: '1.2rem', fontWeight: '650' }}>{doctor.name}</h4>
                  <span style={{
                    background: 'rgba(0, 102, 255, 0.08)', color: 'var(--accent-blue)',
                    border: '1px solid rgba(0, 102, 255, 0.2)', borderRadius: '8px',
                    padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: '600'
                  }}>{doctor.specialty}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.88rem', alignItems: 'center' }}>
                  <Building2 size={16} color="var(--accent-blue)" style={{ opacity: 0.7 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.hospital || 'Private Clinic'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.88rem', alignItems: 'center' }}>
                  <MapPin size={16} color="var(--accent-blue)" style={{ opacity: 0.7 }} /> <span>{doctor.city}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.88rem', alignItems: 'center' }}>
                  <GraduationCap size={16} color="var(--accent-blue)" style={{ opacity: 0.7 }} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.qualification || 'Specialist'}</span>
                </div>
                {doctor.phone && (
                  <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.88rem', alignItems: 'center' }}>
                    <Phone size={16} color="var(--accent-blue)" style={{ opacity: 0.7 }} /> <a href={`tel:${doctor.phone}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '500' }}>{doctor.phone.substring(0, 10)}...</a>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#d97706', fontSize: '1rem' }}>{renderStars(doctor.rating || 4.5)}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: '500' }}>{doctor.rating || 4.5} Rating</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '750', fontSize: '1rem' }}>{doctor.experience_years || '10'}+ Yr</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: '500' }}>Experience</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#059669', fontWeight: '750', fontSize: '1rem' }}>₹{doctor.consultation_fee || 500}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: '500' }}>Consultation</div>
                </div>
              </div>

              {/* Available days */}
              {doctor.available_days?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {(doctor.available_days || []).map(day => (
                    <span key={day} style={{ padding: '0.3rem 0.6rem', background: 'rgba(5, 150, 105, 0.08)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.2)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {day}
                    </span>
                  ))}
                </div>
              )}

              <Link to="/appointments" state={{ doctor }}
                className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '600', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Calendar size={18} /> Schedule Appointment
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Search size={48} color="var(--text-muted)" />
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>No specialists found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or selecting a different specialty.</p>
            <button className="btn btn-secondary" onClick={() => {setSearch(''); setFilter('All')}} style={{ marginTop: '1.5rem' }}>Reset Filters</button>
          </div>
        )}
      </div>
    </div>
  )
}
