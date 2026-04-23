import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { isMockMode, mockUpdateUser } from '../utils/mockData';
import toast from 'react-hot-toast';
import { MdEdit, MdAdd, MdDelete, MdSave } from 'react-icons/md';
import './Profile.css';

const CATEGORIES = ['Technology','Design','Music','Cooking','Education','Fitness','Language','Arts & Crafts','Business','Other'];

export default function Profile() {
  const { user, fetchMe, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [form, setForm] = useState({ name:'', bio:'', location:'', skillsOffered:[], skillsWanted:[] });
  const [newSkill, setNewSkill] = useState({ name:'', category:'Technology', description:'', timeCreditsPerHour:1 });
  const [newWanted, setNewWanted] = useState('');

  useEffect(() => {
    if (user) setForm({ name:user.name||'', bio:user.bio||'', location:user.location||'',
      skillsOffered:user.skillsOffered||[], skillsWanted:user.skillsWanted||[] });
  }, [user]);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      if (isMockMode()) {
        const uid = user.id || user._id;
        const updated = mockUpdateUser(uid, form);
        updateUser({ ...updated, id: uid });
        toast.success('Profile updated!');
        setEditing(false);
        return;
      }
      await api.put('/users/profile/update', form);
      await fetchMe();
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const addOfferedSkill = () => {
    if (!newSkill.name.trim()) return toast.error('Skill name is required');
    setForm(p => ({ ...p, skillsOffered: [...p.skillsOffered, { ...newSkill }] }));
    setNewSkill({ name:'', category:'Technology', description:'', timeCreditsPerHour:1 });
    setShowSkillForm(false);
  };

  const removeOfferedSkill = (idx) => setForm(p => ({ ...p, skillsOffered: p.skillsOffered.filter((_,i) => i !== idx) }));

  const addWantedSkill = () => {
    if (!newWanted.trim()) return;
    setForm(p => ({ ...p, skillsWanted: [...p.skillsWanted, { name: newWanted.trim(), category:'Other' }] }));
    setNewWanted('');
  };

  const removeWantedSkill = (idx) => setForm(p => ({ ...p, skillsWanted: p.skillsWanted.filter((_,i) => i !== idx) }));

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="profile-page">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div><h1>My Profile</h1><p>Manage your skills and personal information</p></div>
        {!editing
          ? <button className="btn btn-primary" onClick={() => setEditing(true)}><MdEdit /> Edit Profile</button>
          : <div style={{display:'flex',gap:10}}>
              <button className="btn btn-ghost" onClick={() => { setEditing(false); setShowSkillForm(false); }}>Cancel</button>
              <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
        }
      </div>

      <div className="profile-layout">
        <div>
          <div className="card profile-info-card">
            <div className="card-body">
              <div className="profile-avatar-section">
                <div className="big-avatar">
                  {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{initials}</span>}
                </div>
                <div style={{flex:1}}>
                  {editing
                    ? <input className="form-input" value={form.name}
                        onChange={e => setForm(p => ({...p, name: e.target.value}))} />
                    : <h2 className="profile-name-big">{user?.name}</h2>
                  }
                  <p style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>{user?.email}</p>
                </div>
              </div>
              <hr className="divider" />
              <div className="form-group">
                <label className="form-label">Bio</label>
                {editing
                  ? <textarea className="form-textarea" rows={3} value={form.bio}
                      onChange={e => setForm(p => ({...p, bio: e.target.value}))}
                      placeholder="Tell the community about yourself..." />
                  : <p style={{color:form.bio?'var(--text)':'var(--text-muted)',fontSize:'0.9rem',lineHeight:1.6}}>
                      {form.bio || 'No bio added yet.'}
                    </p>
                }
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                {editing
                  ? <input className="form-input" value={form.location}
                      onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="City, Country" />
                  : <p style={{color:form.location?'var(--text)':'var(--text-muted)',fontSize:'0.9rem'}}>
                      {form.location || 'No location set.'}
                    </p>
                }
              </div>
              <hr className="divider" />
              <div className="profile-stats">
                <div className="pstat"><span className="pstat-val">{user?.timeCredits||0}</span><span>Credits</span></div>
                <div className="pstat"><span className="pstat-val">{user?.totalExchanges||0}</span><span>Exchanges</span></div>
                <div className="pstat"><span className="pstat-val">{user?.skillsOffered?.length||0}</span><span>Skills</span></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:20}}>
            <div className="card-body">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h3 style={{fontWeight:800}}>🎓 Skills I Teach</h3>
                {editing && (
                  <button className="btn btn-primary btn-sm" onClick={() => setShowSkillForm(true)}>
                    <MdAdd /> Add Skill
                  </button>
                )}
              </div>

              {showSkillForm && editing && (
                <div className="add-skill-form">
                  <div className="form-group">
                    <label className="form-label">Skill Name *</label>
                    <input className="form-input" value={newSkill.name}
                      onChange={e => setNewSkill(p => ({...p, name: e.target.value}))} placeholder="e.g. Python Programming" />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={newSkill.category}
                        onChange={e => setNewSkill(p => ({...p, category: e.target.value}))}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Credits/Hour</label>
                      <input type="number" className="form-input" min={1} max={10}
                        value={newSkill.timeCreditsPerHour}
                        onChange={e => setNewSkill(p => ({...p, timeCreditsPerHour: parseInt(e.target.value)||1}))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={2} value={newSkill.description}
                      onChange={e => setNewSkill(p => ({...p, description: e.target.value}))}
                      placeholder="What will learners get from this session?" />
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowSkillForm(false)}>Cancel</button>
                    <button className="btn btn-success btn-sm" onClick={addOfferedSkill}><MdAdd /> Add Skill</button>
                  </div>
                </div>
              )}

              {form.skillsOffered.length === 0 ? (
                <div className="empty-state" style={{padding:'24px 0'}}>
                  <div className="empty-icon">🎓</div>
                  <h3>No skills listed yet</h3>
                  <p>Add skills you can teach to the community</p>
                </div>
              ) : (
                <div className="offered-skills-list">
                  {form.skillsOffered.map((s, i) => (
                    <div key={i} className="offered-skill-item">
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700}}>{s.name}</div>
                        <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{s.category} · {s.timeCreditsPerHour} credit/hr</div>
                        {s.description && <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:2}}>{s.description}</div>}
                      </div>
                      {editing && (
                        <button className="btn btn-ghost btn-sm" onClick={() => removeOfferedSkill(i)}>
                          <MdDelete style={{color:'var(--danger)'}} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 style={{fontWeight:800,marginBottom:16}}>🌱 Skills I Want to Learn</h3>
              {editing && (
                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  <input className="form-input" value={newWanted}
                    placeholder="Add a skill you want to learn"
                    onChange={e => setNewWanted(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && addWantedSkill()} />
                  <button className="btn btn-primary btn-sm" onClick={addWantedSkill}><MdAdd /></button>
                </div>
              )}
              {form.skillsWanted.length === 0
                ? <p className="text-muted text-sm">No skills listed yet.</p>
                : (
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                    {form.skillsWanted.map((s, i) => (
                      <span key={i} className="wanted-skill-chip">
                        {s.name}
                        {editing && <button onClick={() => removeWantedSkill(i)}>×</button>}
                      </span>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
