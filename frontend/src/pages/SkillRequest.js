import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isMockMode, mockGetSkill, mockCreateExchange } from '../utils/mockData';
import toast from 'react-hot-toast';
import { MdArrowBack, MdAccessTime, MdCalendarToday, MdNotes } from 'react-icons/md';
import './SkillRequest.css';

export default function SkillRequest() {
  const { skillId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ scheduledDate: '', scheduledTime: '', duration: 1, notes: '' });

  useEffect(() => {
    const loadSkill = async () => {
      try {
        if (isMockMode()) {
          const s = mockGetSkill(skillId);
          if (!s) { toast.error('Skill not found'); navigate('/marketplace'); return; }
          setSkill(s); return;
        }
        const res = await api.get(`/skills/${skillId}`);
        setSkill(res.data.skill);
      } catch {
        const s = mockGetSkill(skillId);
        if (s) setSkill(s);
        else { toast.error('Skill not found'); navigate('/marketplace'); }
      } finally {
        setLoading(false);
      }
    };
    loadSkill();
  }, [skillId, navigate]);

  const totalCredits = skill ? skill.timeCreditsPerHour * form.duration : 0;
  const hasEnoughCredits = (user?.timeCredits || 0) >= totalCredits;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduledDate || !form.scheduledTime) return toast.error('Please select a date and time');
    if (!hasEnoughCredits) return toast.error('Insufficient time credits');

    const scheduledDate = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
    if (scheduledDate < new Date()) return toast.error('Please select a future date and time');

    setSubmitting(true);
    try {
      if (isMockMode()) {
        mockCreateExchange(user.id || user._id, {
          skillId, scheduledDate: scheduledDate.toISOString(), duration: form.duration, notes: form.notes
        });
        toast.success('Session request sent! 🎉');
        navigate('/exchanges');
        return;
      }
      await api.post('/exchanges/request', {
        skillId, scheduledDate, duration: form.duration, notes: form.notes
      });
      toast.success('Session request sent! 🎉');
      navigate('/exchanges');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!skill) return null;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="skill-request-page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{marginBottom:20}}>
        <MdArrowBack /> Back
      </button>
      <div className="page-header">
        <h1>Request a Session</h1>
        <p>Schedule a learning session with {skill.provider?.name}</p>
      </div>

      <div className="request-layout">
        <div className="card">
          <div className="card-body">
            <h3 style={{fontWeight:800,marginBottom:20}}>Session Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><MdCalendarToday /> Preferred Date *</label>
                <input type="date" className="form-input" min={minDateStr}
                  value={form.scheduledDate}
                  onChange={e => setForm(p => ({...p, scheduledDate: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time *</label>
                <input type="time" className="form-input" value={form.scheduledTime}
                  onChange={e => setForm(p => ({...p, scheduledTime: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label"><MdAccessTime /> Duration (hours) *</label>
                <div className="duration-picker">
                  {[1, 1.5, 2, 3].map(d => (
                    <button key={d} type="button"
                      className={`duration-btn ${form.duration === d ? 'active' : ''}`}
                      onClick={() => setForm(p => ({...p, duration: d}))}>
                      {d}h
                    </button>
                  ))}
                  <input type="number" className="form-input duration-custom"
                    min={0.5} max={8} step={0.5} value={form.duration}
                    onChange={e => setForm(p => ({...p, duration: parseFloat(e.target.value) || 1}))}
                    placeholder="Custom" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><MdNotes /> Message to Provider (optional)</label>
                <textarea className="form-textarea" rows={4}
                  placeholder="Tell the provider what you want to learn, your current level..."
                  value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
              </div>

              {!hasEnoughCredits && (
                <div className="credit-warning">
                  ⚠️ You need <strong>{totalCredits} credits</strong> but only have <strong>{user?.timeCredits || 0}</strong>.
                  Teach skills to earn more credits!
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg w-full"
                disabled={submitting || !hasEnoughCredits}>
                {submitting ? 'Sending Request...' : `Send Request (${totalCredits} credits)`}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="card request-summary">
            <div className="card-body">
              <h3 style={{fontWeight:800,marginBottom:16}}>Session Summary</h3>
              <div className="summary-skill">
                <div className="summary-skill-icon">🎓</div>
                <div>
                  <div style={{fontWeight:800}}>{skill.title}</div>
                  <div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{skill.category}</div>
                </div>
              </div>
              <hr className="divider" />
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Provider</span><span style={{fontWeight:700}}>{skill.provider?.name}</span>
                </div>
                <div className="summary-row">
                  <span>Rate</span><span className="credit-chip">{skill.timeCreditsPerHour} cr/hr</span>
                </div>
                <div className="summary-row">
                  <span>Duration</span><span style={{fontWeight:700}}>{form.duration} hour{form.duration !== 1 ? 's' : ''}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total Cost</span>
                  <span className="credit-chip" style={{fontSize:'1rem',padding:'6px 14px'}}>
                    ⏰ {totalCredits} credits
                  </span>
                </div>
              </div>
              <hr className="divider" />
              <div className="your-balance">
                <span style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>Your Balance</span>
                <span style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.4rem',color:hasEnoughCredits?'var(--success)':'var(--danger)'}}>
                  {user?.timeCredits || 0} credits
                </span>
              </div>
              {hasEnoughCredits && (
                <div style={{marginTop:12,padding:'10px',background:'#d1fae5',borderRadius:8,fontSize:'0.82rem',color:'#065f46',fontWeight:600,textAlign:'center'}}>
                  ✅ You have enough credits for this session
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{marginTop:16}}>
            <div className="card-body">
              <h4 style={{fontWeight:700,marginBottom:8,fontSize:'0.875rem'}}>How it works</h4>
              <ol style={{paddingLeft:18,color:'var(--text-muted)',fontSize:'0.82rem',lineHeight:2}}>
                <li>Send your session request</li>
                <li>Provider reviews and accepts</li>
                <li>Credits deducted on accept</li>
                <li>Complete the session</li>
                <li>Rate each other</li>
                <li>Provider receives credits</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
