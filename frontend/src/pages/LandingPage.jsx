// LandingPage.jsx - Hero landing page for CureConnect
import { Link } from 'react-router-dom'
import { 
  Bot, Ambulance, Stethoscope, PenTool, 
  Dna, CheckCircle, Globe, Activity, Search, Star 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import heroImage from '../assets/hero-doctor.png'

// Feature cards data
const features = [
  {
    icon: <Bot size={32} />,
    title: 'AI Symptom Checker',
    desc: 'Describe your symptoms and get instant AI-powered disease risk assessment with recommended actions.',
    link: '/symptoms',
    color: '#0066ff'
  },
  {
    icon: <Ambulance size={32} />,
    title: 'First Aid Guidance',
    desc: 'Life-saving step-by-step first aid instructions for emergencies like heart attacks, choking, burns and more.',
    link: '/firstaid',
    color: '#ef4444'
  },
  {
    icon: <Stethoscope size={32} />,
    title: 'Find Specialists',
    desc: 'Connect instantly with nearby specialist doctors matched to your symptoms and health needs.',
    link: '/firstaid',
    color: '#0d9488'
  }
]

const stats = [
  { value: '50+', label: 'Diseases Detected' },
  { value: '100+', label: 'Specialist Doctors' },
  { value: '6', label: 'First Aid Guides' },
  { value: '24/7', label: 'AI Available' }
]

const testimonials = [
  { name: 'Priya M.', city: 'Mumbai', text: 'CureConnect identified my symptoms as serious and I went to the doctor immediately. Turned out it was early-stage diabetes. This app saved my life!', rating: 5 },
  { name: 'Rahul S.', city: 'Delhi', text: 'The first aid guide walked me through helping my father during a cardiac episode before the ambulance arrived. Incredibly clear instructions.', rating: 5 },
  { name: 'Ananya K.', city: 'Bangalore', text: 'Found and booked an appointment with a specialist within minutes. The symptom checker pointed me to exactly the right type of doctor.', rating: 5 }
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div style={{ overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* ---- HERO SECTION ---- */}
      <section style={{ 
        position: 'relative',
        padding: '8rem 1.5rem 6rem', 
        textAlign: 'center', 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="animate-fadeInUp" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* SDG Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: '50px',
            border: '1px solid rgba(0, 102, 255, 0.2)',
            background: 'rgba(0, 102, 255, 0.05)',
            fontSize: '0.82rem', color: 'var(--accent-blue)', marginBottom: '2rem',
            fontWeight: '600', letterSpacing: '0.03em'
          }}>
            <Globe size={14} /> Supporting SDG 3 — Universal Health Accessibility
          </div>

          <h1 style={{ marginBottom: '1.25rem', lineHeight: '1.1', color: 'var(--text-primary)' }}>
            Your AI-Powered<br />
            <span className="gradient-text">Healthcare Navigator</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
            Transform symptoms into actionable insights. Get instant disease risk assessments,
            life-saving first aid guidance, and seamless connections to nearby specialists.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/symptoms" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} /> Check My Symptoms
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
                Get Started Free
              </Link>
            )}
            <Link to="/firstaid" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ambulance size={18} /> Emergency First Aid
            </Link>
          </div>
        </div>
      </section>

      {/* ---- STATS SECTION ---- */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-4">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s`, background: 'white' }}>
                <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{stat.value}</div>
                <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURES SECTION ---- */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
          <div className="page-header" style={{ marginBottom: '4rem' }}>
            <h2 style={{ color: 'var(--text-primary)' }}>Everything You Need for <span className="gradient-text">Better Health</span></h2>
            <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>From symptom to specialist, CureConnect guides your entire healthcare journey</p>
          </div>

          <div className="grid-3">
            {features.map((feature, i) => (
              <Link key={i} to={feature.link} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{
                  cursor: 'pointer', height: '100%', background: 'white',
                  borderColor: 'var(--border)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: `${feature.color}10`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', marginBottom: '1.5rem'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ color: feature.color, marginBottom: '0.75rem', fontSize: '1.25rem' }}>{feature.title}</h3>
                  <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{feature.desc}</p>
                  <div style={{ marginTop: '1.5rem', color: feature.color, fontSize: '0.95rem', fontWeight: '600' }}>
                    Explore → 
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="page-header" style={{ marginBottom: '4rem' }}>
            <h2 style={{ color: 'var(--text-primary)' }}>How <span className="gradient-text">CureConnect</span> Works</h2>
          </div>
          <div className="grid-3" style={{ gap: '2rem' }}>
            {[
              { step: '01', title: 'Enter Symptoms', desc: 'Select or type your symptoms into our intelligent checker', icon: <PenTool size={32} /> },
              { step: '02', title: 'AI Analysis', desc: 'Our engine analyzes patterns across 50+ diseases instantly', icon: <Dna size={32} /> },
              { step: '03', title: 'Take Action', desc: 'Get first aid guidance, risk assessment, and connect with doctors', icon: <CheckCircle size={32} /> }
            ].map((item, i) => (
              <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white' }}>
                <div style={{ color: 'var(--accent-blue)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>{item.icon}</div>
                <div style={{
                  display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '8px',
                  background: 'rgba(0, 102, 255, 0.08)', color: 'var(--accent-blue)',
                  fontSize: '0.8rem', fontWeight: '700', marginBottom: '1rem'
                }}>
                  STEP {item.step}
                </div>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{item.title}</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- TESTIMONIALS ---- */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
          <div className="page-header" style={{ marginBottom: '4rem' }}>
            <h2 style={{ color: 'var(--text-primary)' }}>Trusted by <span className="gradient-text">Thousands</span></h2>
          </div>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card" style={{ background: 'white' }}>
                <div style={{ color: '#fbbf24', marginBottom: '1rem', display: 'flex', gap: '2px' }}>
                  {[...Array(t.rating)].map((_, index) => (
                    <Star key={index} size={16} fill="#fbbf24" stroke="none" />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-blue), #00ccff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700'
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA SECTION ---- */}
      <section style={{ padding: '4rem 1.5rem 8rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '800px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(0,102,255,0.05), rgba(0,204,255,0.05))',
          border: '1px solid rgba(0, 102, 255, 0.1)',
          borderRadius: '24px', padding: '4rem 2rem'
        }}>
          <div style={{ color: 'var(--accent-blue)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Activity size={48} />
          </div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Ready to Take Charge of Your Health?</h2>
          <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Join thousands of users who trust CureConnect for their healthcare decisions.
          </p>
          <Link to="/symptoms" className="btn btn-primary" style={{ fontSize: '1rem', padding: '1rem 3rem', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Search size={20} /> Start Symptom Check — It's Free
          </Link>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '3rem 1.5rem', textAlign: 'center',
        background: 'var(--bg-secondary)'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span>© 2026 CureConnect · AI Healthcare Navigator · Supporting SDG 3 <Globe size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></span>
          <br />
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            ⚠️ For informational purposes only. Always consult a medical professional for diagnosis.
          </span>
        </p>
      </footer>
    </div>
  )
}
