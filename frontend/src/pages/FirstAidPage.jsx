import { useState, useEffect } from 'react'
import { 
  Ambulance, Heart, Wind, Brain, Flame, 
  Bone, AlertCircle, ClipboardList, Lightbulb, 
  XCircle, Phone, Activity
} from 'lucide-react'
import { firstAidAPI } from '../api/api'

const severityColors = {
  life_threatening: { color: '#dc2626', bg: 'rgba(239, 68, 68, 0.08)', label: 'Life Threatening' },
  severe: { color: '#d97706', bg: 'rgba(245, 158, 11, 0.08)', label: 'Severe' },
  moderate: { color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)', label: 'Moderate' },
  mild: { color: '#059669', bg: 'rgba(16, 185, 129, 0.08)', label: 'Mild' }
}

const ConditionIcon = ({ condition, size = 24, color = 'var(--accent-blue)' }) => {
  const icons = {
    heart_attack: Heart,
    choking: Wind,
    stroke: Brain,
    burn: Flame,
    fracture: Bone,
    allergic_reaction: AlertCircle
  }
  const Icon = icons[condition] || Activity
  return <Icon size={size} color={color} />
}

export default function FirstAidPage() {
  const [guides, setGuides] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fallback guides in case API is not reachable
  const fallbackGuides = [
    { id: '1', condition: 'heart_attack', title: 'Heart Attack', description: 'Call 108 immediately and give aspirin if available.', severity: 'life_threatening', icon: '❤️',
      steps: [
        { step_number: 1, instruction: 'Call emergency services (108) immediately', tip: 'Do not delay calling' },
        { step_number: 2, instruction: 'Help them sit comfortably, loosen tight clothing', tip: 'Keep them calm' },
        { step_number: 3, instruction: 'Give aspirin if available and not allergic', tip: '325mg crushed or chewed' },
        { step_number: 4, instruction: 'Begin CPR if person is unconscious and not breathing', tip: '30 compressions, 2 breaths' }
      ], do_nots: ['Do not leave them alone', 'Do not let them walk', 'Do not give food or water'], when_to_call_911: 'Immediately' },
    { id: '2', condition: 'choking', title: 'Choking', description: 'Perform Heimlich maneuver if person cannot breathe.', severity: 'life_threatening', icon: '🫁',
      steps: [
        { step_number: 1, instruction: 'Ask: Can you speak? If yes, encourage coughing', tip: 'Do not interfere if coughing forcefully' },
        { step_number: 2, instruction: 'Stand behind them, lean them forward', tip: 'Support their chest with one hand' },
        { step_number: 3, instruction: 'Give 5 firm back blows with heel of hand', tip: 'Between shoulder blades' },
        { step_number: 4, instruction: 'Give 5 abdominal thrusts (Heimlich maneuver)', tip: 'Fist above navel, thrust inward and upward' }
      ], do_nots: ['Do not do blind finger sweeps'], when_to_call_911: 'If choking does not resolve in 1-2 minutes' },
    { id: '3', condition: 'stroke', title: 'Stroke', description: 'Use F.A.S.T. - Face, Arms, Speech, Time. Call 108.', severity: 'life_threatening', icon: '🧠',
      steps: [
        { step_number: 1, instruction: 'Use FAST: Face drooping, Arm weakness, Speech difficulty, Time', tip: 'Even one sign means stroke' },
        { step_number: 2, instruction: 'Call 108 immediately, note the time symptoms started', tip: 'Time is brain cells' },
        { step_number: 3, instruction: 'Keep person calm, lie down with head/shoulders raised', tip: 'Do not elevate legs' },
        { step_number: 4, instruction: 'Do NOT give food, water, or aspirin', tip: 'Swallowing may be impaired' }
      ], do_nots: ['Do not give aspirin', 'Do not let them sleep it off'], when_to_call_911: 'Immediately upon recognizing FAST symptoms' },
    { id: '4', condition: 'burn', title: 'Burns', description: 'Cool with running water for 10-20 minutes. Do not use ice.', severity: 'moderate', icon: '🔥',
      steps: [
        { step_number: 1, instruction: 'Remove from burn source safely', tip: 'Ensure your own safety first' },
        { step_number: 2, instruction: 'Cool with cool (not cold) running water for 20 minutes', tip: 'Never use ice or butter' },
        { step_number: 3, instruction: 'Remove jewelry near the burn area', tip: 'Do this before swelling starts' },
        { step_number: 4, instruction: 'Cover loosely with non-stick sterile bandage', tip: 'Do not wrap tightly' }
      ], do_nots: ['Do not use ice', 'Do not break blisters', 'Do not apply butter or toothpaste'], when_to_call_911: 'For large burns, chemical burns, or burns on face/hands' },
    { id: '5', condition: 'fracture', title: 'Bone Fracture', description: 'Immobilize the injured limb. Do not try to straighten it.', severity: 'moderate', icon: '🦴',
      steps: [
        { step_number: 1, instruction: 'Keep the injured area still, do not straighten', tip: 'If bone visible, cover with clean cloth' },
        { step_number: 2, instruction: 'Apply splint using boards or rolled newspapers', tip: 'Extend beyond joints above and below' },
        { step_number: 3, instruction: 'Apply ice pack wrapped in cloth', tip: '20 minutes on, 20 minutes off' },
        { step_number: 4, instruction: 'Seek medical help or call emergency services', tip: 'Do not put weight on injured area' }
      ], do_nots: ['Do not straighten limb', 'Do not move if spinal injury suspected'], when_to_call_911: 'For open fractures or suspected spinal injury' },
    { id: '6', condition: 'allergic_reaction', title: 'Severe Allergy', description: 'Use EpiPen immediately and call 108 for anaphylaxis.', severity: 'life_threatening', icon: '⚠️',
      steps: [
        { step_number: 1, instruction: 'Identify and remove the allergen if possible', tip: 'Common: food, bee stings, medications' },
        { step_number: 2, instruction: 'Use epinephrine auto-injector (EpiPen) if available', tip: 'Inject outer thigh, even through clothing' },
        { step_number: 3, instruction: 'Call emergency services (108) immediately', tip: 'Even if EpiPen was used' },
        { step_number: 4, instruction: 'Help person lie down with legs elevated', tip: 'If breathing difficulty, sit upright' }
      ], do_nots: ['Do not make person walk', 'Do not assume symptoms will improve'], when_to_call_911: 'Immediately for throat swelling, difficulty breathing' }
  ]

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await firstAidAPI.getAll()
        setGuides(res.data.guides?.length > 0 ? res.data.guides : fallbackGuides)
      } catch {
        setGuides(fallbackGuides)
      } finally { setLoading(false) }
    }
    fetchGuides()
  }, [])

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}><div className="spinner"></div></div>

  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="page-header">
          <h1 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Ambulance size={32} color="var(--accent-blue)" /> First Aid Guides
          </h1>
          <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>Life-saving step-by-step emergency guidance. Act fast, act right.</p>
        </div>

        {/* Emergency Callout */}
        <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '1rem 1.5rem', fontSize: '1.2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '2px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={28} /> <span>For any life-threatening emergency, <strong>call 108 IMMEDIATELY</strong></span>
        </div>

        {/* Guide Cards Grid */}
        {!selected ? (
          <div className="grid-3">
            {guides.map((guide) => {
              const sev = severityColors[guide.severity] || severityColors.moderate
              return (
                <div key={guide.id || guide.condition} className="glass-card" style={{ cursor: 'pointer', background: 'white', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
                  onClick={() => setSelected(guide)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <ConditionIcon condition={guide.condition} size={40} color={sev.color} />
                    <span className={`badge badge-${guide.severity === 'life_threatening' ? 'critical' : guide.severity === 'severe' ? 'high' : guide.severity === 'moderate' ? 'medium' : 'low'}`} style={{ fontSize: '0.72rem' }}>
                      {sev.label}
                    </span>
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{guide.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{guide.description}</p>
                  <div style={{ marginTop: '1.25rem', color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: '600' }}>
                    View Life-Saving Steps →
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ---- DETAIL VIEW ---- */
          <div style={{ maxWidth: '750px', margin: '0 auto', paddingBottom: '3rem' }}>
            <button className="btn btn-secondary" onClick={() => setSelected(null)} style={{ marginBottom: '2rem' }}>
              ← Back to All Guides
            </button>

            <div className="glass-card animate-fadeInUp" style={{ background: 'white', padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                <ConditionIcon condition={selected.condition} size={56} color={severityColors[selected.severity]?.color} />
                <div>
                  <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{selected.title}</h2>
                  <span className={`badge badge-${selected.severity === 'life_threatening' ? 'critical' : 'medium'}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
                    {severityColors[selected.severity]?.label}
                  </span>
                </div>
              </div>

              <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>{selected.description}</p>

              {/* Steps */}
              <h4 style={{ color: 'var(--accent-blue)', marginBottom: '1.25rem', fontSize: '1.2rem', borderBottom: '2px solid rgba(0, 102, 255, 0.1)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} /> Step-by-Step Instructions
              </h4>
              {(selected.steps || []).map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent-blue)' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(0, 102, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: '700', fontSize: '0.95rem', flexShrink: 0 }}>
                    {step.step_number || i + 1}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.4rem', fontSize: '1.05rem' }}>{step.instruction}</div>
                    {step.tip && <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', background: 'rgba(255, 255, 255, 0.5)', padding: '0.4rem 0.75rem', borderRadius: '8px', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={14} color="#f59e0b" /> <span><strong>Tip:</strong> {step.tip}</span>
                    </div>}
                  </div>
                </div>
              ))}

              {/* Do Nots */}
              {selected.do_nots?.length > 0 && (
                <div style={{ marginTop: '2.5rem', background: 'rgba(239, 68, 68, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <h4 style={{ color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={20} /> CRITICAL: Do NOT
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selected.do_nots.map((item, i) => (
                      <li key={i} style={{ color: '#991b1b', padding: '0.5rem 0', borderBottom: '1px solid rgba(239,68,68,0.1)', display: 'flex', gap: '0.75rem', fontWeight: '500' }}>
                        <span style={{ color: '#dc2626' }}>●</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Emergency Warning */}
              {selected.when_to_call_911 && (
                <div className="alert alert-error" style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={20} /> <span><strong>Emergency Action:</strong> {selected.when_to_call_911.includes('Call') ? selected.when_to_call_911 : `Call 108 immediately if: ${selected.when_to_call_911}`}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
