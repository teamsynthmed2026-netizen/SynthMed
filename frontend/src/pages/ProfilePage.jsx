// ProfilePage.jsx - Expanded User Profile & Medical ID
import { useState } from 'react'
import { motion } from 'framer-motion'
import { IdCard, AlertCircle, ClipboardList, Phone, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  
  // Mock biological data - in a real app this would come from an API
  const [profileData, setProfileData] = useState({
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['None'],
    emergencyContact: 'Jane Doe (+91 98765 43210)',
    weight: '72kg',
    height: '178cm'
  })

  return (
    <div className="page" style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '2rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
             <div style={{ 
               width: '100px', height: '100px', borderRadius: '50%', 
               background: 'var(--accent-blue)', display: 'flex', 
               alignItems: 'center', justifyContent: 'center', 
               fontSize: '3rem', color: 'white', fontWeight: '800'
             }}>
               {user?.name?.charAt(0)}
             </div>
             <div>
               <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{user?.name}</h1>
               <p style={{ color: 'var(--text-secondary)' }}>Patient ID: <span style={{ fontFamily: 'monospace' }}>{user?.id}</span></p>
               <span className="badge badge-low" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                 <CheckCircle size={14} /> Verified Profile
               </span>
             </div>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
             {/* Medical ID Card */}
             <div className="glass-card" style={{ background: 'white', gridColumn: 'span 2' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-blue)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <IdCard size={22} /> Official Medical ID
                 </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                   <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Blood Group</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{profileData.bloodGroup}</div>
                   </div>
                   <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Weight</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{profileData.weight}</div>
                   </div>
                   <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Height</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{profileData.height}</div>
                   </div>
                </div>
             </div>

             {/* Allergies & Conditions */}
             <div className="glass-card" style={{ background: 'white' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <AlertCircle size={18} color="#ef4444" /> Allergies
                 </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                   {profileData.allergies.map((a, i) => (
                      <span key={i} style={{ padding: '0.4rem 0.8rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{a}</span>
                   ))}
                </div>
             </div>

             <div className="glass-card" style={{ background: 'white' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <ClipboardList size={18} color="var(--accent-blue)" /> Chronic Conditions
                 </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                   {profileData.chronicConditions.map((c, i) => (
                      <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{c}</span>
                   ))}
                </div>
             </div>

             {/* Emergency Contact */}
             <div className="glass-card" style={{ background: 'white', gridColumn: 'span 2' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Phone size={18} color="#ef4444" /> Emergency Contact
                 </h4>
                <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontWeight: '600' }}>{profileData.emergencyContact}</span>
                   <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                </div>
             </div>
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
             <button className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>Download Health Record (PDF)</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
