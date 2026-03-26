// SymptomCheckerPage.jsx - Shows n8n AI recommendations on results
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, AlertCircle, Circle, CheckCircle, Tag,
  Dna, Zap, Stethoscope, Ambulance, Search,
  Activity, ChevronUp, ChevronDown, Bot
} from 'lucide-react'
import { symptomsAPI } from '../api/api'

const commonSymptoms = [
  'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Vomiting',
  'Chest Pain', 'Shortness of Breath', 'Dizziness', 'Stomach Pain',
  'Diarrhea', 'Muscle Aches', 'Joint Pain', 'Rash', 'Sore Throat',
  'Runny Nose', 'Chills', 'Loss of Appetite', 'Sweating', 'Back Pain',
  'Frequent Urination', 'Excessive Thirst', 'Blurred Vision', 'Swelling',
  'Chest Tightness', 'Wheezing', 'Left Arm Pain', 'Confusion', 'Light Sensitivity'
]

const riskColors = { critical: '#ef4444', high: '#f59e0b', medium: '#7c3aed', low: '#10b981' }
const RiskIcon = ({ level, size = 24 }) => {
  if (level === 'critical') return <AlertTriangle size={size} color={riskColors.critical} />
  if (level === 'high') return <AlertCircle size={size} color={riskColors.high} />
  if (level === 'medium') return <Circle size={size} color={riskColors.medium} fill={riskColors.medium} fillOpacity={0.2} />
  return <CheckCircle size={size} color={riskColors.low} />
}
const riskBg = { critical: 'rgba(239, 68, 68, 0.05)', high: 'rgba(245, 158, 11, 0.05)', medium: 'rgba(124, 58, 237, 0.05)', low: 'rgba(16, 185, 129, 0.05)' }

// Parse whatever n8n sends back into a displayable string list or object
function parseN8nResponse(n8nData) {
  if (!n8nData) return null;
  // n8n returns array or object depending on config
  const data = Array.isArray(n8nData) ? n8nData[0] : n8nData;
  // Common n8n agent output fields
  return data?.output || data?.text || data?.message || data?.recommendation ||
    data?.response || data?.content || data?.result ||
    (typeof data === 'string' ? data : null);
}

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showJson, setShowJson] = useState(false)

  const toggleSymptom = (s) => {
    if (selectedSymptoms.includes(s))
      setSelectedSymptoms(selectedSymptoms.filter(x => x !== s))
    else if (selectedSymptoms.length < 15)
      setSelectedSymptoms([...selectedSymptoms, s])
  }

  const handleCheck = async () => {
    if (selectedSymptoms.length === 0 && !prompt.trim()) {
      setError('Please select symptoms or describe them below'); return
    }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await symptomsAPI.check({ symptoms: selectedSymptoms, prompt: prompt.trim() })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Make sure backend is running on port 5000.')
    } finally { setLoading(false) }
  }

  const reset = () => { setSelectedSymptoms([]); setPrompt(''); setResult(null); setError(''); setShowJson(false) }

  const analysis = result?.analysis
  const n8nReply = parseN8nResponse(result?.n8n_response)
  const n8nRaw = result?.n8n_response

  /* ====================== RESULTS ====================== */
  if (result) return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          {/* n8n Banner */}
          {result.n8n_notified && (
            <div className="alert alert-success animate-fadeInUp" style={{ marginBottom: '1.5rem', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ⚡ AI Analysis Complete — Recommendations received via n8n
            </div>
          )}
          {!result.n8n_notified && (
            <div className="alert alert-error animate-fadeInUp" style={{ marginBottom: '1.5rem', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              ⚠️ Using local analysis — AI network currently unavailable
            </div>
          )}

          {/* Risk Banner */}
          <div className="glass-card animate-fadeInUp" style={{
            marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem',
            borderColor: `${riskColors[analysis.risk_level]}40`, background: riskBg[analysis.risk_level],
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <RiskIcon level={analysis.risk_level} size={56} />
            </div>
            <span className={`badge badge-${analysis.risk_level}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem', marginBottom: '1rem', display: 'inline-block' }}>
              {analysis.risk_level?.toUpperCase()} RISK
            </span>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.85rem', borderRadius: '8px', background: 'rgba(0, 102, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(0, 102, 255, 0.1)', fontSize: '0.85rem' }}>
                <Tag size={14} /> {selectedSymptoms.length > 0 ? `${selectedSymptoms.length} symptoms` : 'Prompt only'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.85rem', borderRadius: '8px', background: 'rgba(0, 102, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(0, 102, 255, 0.1)', fontSize: '0.85rem' }}>
                <Dna size={14} /> {analysis.total_matches} conditions matched
              </span>
            </div>
          </div>

          {/* ✅ n8n AI Recommendations — primary output */}
          {n8nReply ? (
            <div className="glass-card animate-fadeInUp" style={{ marginBottom: '1.5rem', borderColor: 'rgba(0,102,255,0.2)', background: 'white', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Zap size={24} color="var(--accent-blue)" />
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>AI Recommendations</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: '600' }}>CureConnect AI Assistant</span>
                </div>
              </div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                {n8nReply}
              </div>
            </div>
          ) : result.n8n_notified ? (
            /* n8n responded but no parseable text — show raw JSON */
            <div className="glass-card animate-fadeInUp" style={{ marginBottom: '1.5rem', borderColor: 'var(--border)', background: 'white' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>⚡ AI Response Details</h3>
              <pre style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', fontSize: '0.78rem', color: '#334155', border: '1px solid var(--border)', overflowX: 'auto', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace' }}>
                {JSON.stringify(n8nRaw, null, 2)}
              </pre>
            </div>
          ) : null}

          {/* Possible Conditions (local AI) */}
          {analysis.possible_diseases?.length > 0 && (
            <div className="glass-card animate-fadeInUp" style={{ marginBottom: '1.5rem', background: 'white' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>🧬 Matched Conditions</h3>
              {analysis.possible_diseases.map((d, i) => (
                <div key={i} style={{ marginBottom: '0.875rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: `4px solid ${riskColors[d.risk_level]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem', fontSize: '1rem' }}>{d.disease}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Stethoscope size={14} color="var(--accent-blue)" />
                          <span style={{ fontWeight: '500' }}>{d.recommended_specialty}</span>
                        </span>
                        {d.first_aid_guide && (
                          <Link to="/firstaid" style={{ color: '#dc2626', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Ambulance size={14} /> First Aid →
                          </Link>
                        )}
                      </div>
                      {d.matching_symptoms?.length > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Matched: {d.matching_symptoms.join(', ')}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: riskColors[d.risk_level], lineHeight: 1 }}>{d.probability}%</div>
                      <span className={`badge badge-${d.risk_level}`} style={{ fontSize: '0.7rem' }}>{d.risk_level}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px' }}>
                    <div style={{ height: '100%', width: `${d.probability}%`, background: `linear-gradient(90deg, ${riskColors[d.risk_level]}, ${riskColors[d.risk_level]}cc)`, borderRadius: '10px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: '2rem' }}>
            <Link to="/firstaid" className="btn btn-secondary" style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ambulance size={18} /> First Aid Guides
            </Link>
            <Link to="/doctors" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={18} /> Find Doctors
            </Link>
            <button className="btn btn-secondary" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} /> Check Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  /* ====================== INPUT ====================== */
  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="page-header">
          <h1 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Bot size={32} color="var(--accent-blue)" /> AI Symptom Checker
          </h1>
          <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>Select symptoms or describe them — Professional AI analysis</p>
        </div>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          {/* Symptom Tags */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'white', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Select Your Symptoms</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Click icons to select. Selected: <strong style={{ color: 'var(--accent-blue)' }}>{selectedSymptoms.length}</strong>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {commonSymptoms.map(s => (
                <span key={s} className={`tag ${selectedSymptoms.includes(s) ? 'selected' : ''}`} onClick={() => toggleSymptom(s)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedSymptoms.includes(s) && <CheckCircle size={14} />} {s}
                </span>
              ))}
            </div>
            {selectedSymptoms.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedSymptoms.map(s => (
                  <span key={s} onClick={() => toggleSymptom(s)} style={{ padding: '0.35rem 0.8rem', borderRadius: '50px', background: 'rgba(0, 102, 255, 0.08)', color: 'var(--accent-blue)', border: '1px solid rgba(0, 102, 255, 0.2)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}>
                    {s} <span style={{ opacity: 0.6, marginLeft: '4px' }}>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Prompt */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'white', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} color="var(--accent-blue)" /> Describe Symptoms <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>(optional)</span></h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {selectedSymptoms.length > 0 ? 'Add more details about how you feel for a more accurate analysis.' : 'Describe your health concerns in your own words.'}
            </p>
            <textarea rows={5} placeholder="e.g. 'I have had a dull ache in my lower back for 3 days, which worsens when sitting...'"
              value={prompt} onChange={e => setPrompt(e.target.value)} style={{ resize: 'vertical', width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>

          {error && <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={handleCheck}
              disabled={loading || (selectedSymptoms.length === 0 && !prompt.trim())}
              style={{ fontSize: '1rem', padding: '1rem 3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {loading ? <Activity className="spinner-icon" size={20} /> : <Search size={20} />}
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>
            {(selectedSymptoms.length > 0 || prompt.trim()) && (
              <button className="btn btn-secondary" onClick={reset}>Clear All</button>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
              <div className="spinner"></div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Dna size={18} color="var(--accent-blue)" /> AI is analyzing your symptoms — Please wait...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
