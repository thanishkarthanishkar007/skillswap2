import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { isMockMode } from '../utils/mockData';
import toast from 'react-hot-toast';
import logo from '../logo.png';
import './RegisterPage.css';

// ── Constants ─────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  'JavaScript','Python','Java','React','Node.js','Guitar','Piano','Yoga',
  'Spanish','French','Tamil','Cooking','Photography','Excel','Drawing',
  'Meditation','Public Speaking','Graphic Design','Video Editing','Chess'
];
const CATEGORIES = ['Technology','Design','Music','Cooking','Education','Fitness','Language','Arts & Crafts','Business','Other'];
const STEPS = [
  { num: 1, label: 'Account Info',    icon: '👤' },
  { num: 2, label: 'Skill & Proof',   icon: '🎓' },
  { num: 3, label: 'Learning Goals',  icon: '🌱' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg','image/jpg','image/png','application/pdf'];
const ALLOWED_EXTS  = ['.jpg','.jpeg','.png','.pdf'];

// ── Helpers ───────────────────────────────────────────────────
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (type) => {
  if (type === 'application/pdf') return '📄';
  if (type?.startsWith('image/')) return '🖼️';
  return '📎';
};

// ── Component ─────────────────────────────────────────────────
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});

  // Upload state
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | done | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null); // { url, originalName, mimetype, size }
  const [previewUrl, setPreviewUrl] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    skillsOffered: [], skillsWanted: [],
    bio: '', location: ''
  });
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });

  // ── Validation ──────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.skillsOffered.length === 0) e.skillsOffered = 'Add at least one skill you can teach';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ──────────────────────────────────────────────
  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
    setErrors({});
    window.scrollTo(0, 0);
  };

  const goBack = () => { setStep(s => s - 1); setErrors({}); };

  // ── Skill management ─────────────────────────────────────────
  const addSkill = (type, val) => {
    const v = val.trim();
    if (!v) return;
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    if (!form[key].find(s => s.name.toLowerCase() === v.toLowerCase())) {
      setForm(p => ({ ...p, [key]: [...p[key], { name: v, category: 'Other' }] }));
    }
    setSkillInput(p => ({ ...p, [type]: '' }));
  };

  const removeSkill = (type, name) => {
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setForm(p => ({ ...p, [key]: p[key].filter(s => s.name !== name) }));
  };

  // ── File upload ──────────────────────────────────────────────
  const validateFile = (file) => {
    if (!file) return 'No file selected';
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTS.includes(ext)) {
      return 'Invalid file type. Please upload PDF, JPG, or PNG only.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 5MB. Your file is ${formatSize(file.size)}.`;
    }
    return null;
  };

  const processFile = useCallback(async (file) => {
    const err = validateFile(file);
    if (err) { toast.error(err); return; }

    // Generate local preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    // Mock mode — skip real upload, just store file info locally
    if (isMockMode()) {
      setUploadState('uploading');
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 95));
        if (progress >= 95) clearInterval(interval);
      }, 120);

      await new Promise(r => setTimeout(r, 1200));
      clearInterval(interval);
      setUploadProgress(100);
      setUploadState('done');
      setUploadedFile({
        url: `/uploads/mock_${Date.now()}_${file.name}`,
        originalName: file.name,
        mimetype: file.type,
        size: file.size,
        sizeFormatted: formatSize(file.size),
      });
      toast.success('Certificate uploaded! ✅');
      return;
    }

    // Real upload to backend
    setUploadState('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const res = await api.post('/upload/certificate-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(pct);
        }
      });
      setUploadState('done');
      setUploadedFile(res.data.file);
      toast.success('Certificate uploaded successfully! ✅');
    } catch (err) {
      setUploadState('error');
      setUploadProgress(0);
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  }, []);

  // Drag and drop handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const removeUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadState('idle');
    setUploadProgress(0);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const payload = {
        ...data,
        ...(uploadedFile && {
          skillProof: uploadedFile.url,
          skillProofOriginalName: uploadedFile.originalName,
          skillProofMimeType: uploadedFile.mimetype,
        })
      };
      await register(payload);
      toast.success('🎉 Account created! Welcome to SkillSwap!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────
  const initials = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const passwordStrength = getPasswordStrength(form.password);

  return (
    <div className="reg-page">
      {/* Left panel */}
      <div className="reg-visual">
        <div className="reg-visual-inner">
          <img src={logo} alt="SkillSwap" className="reg-logo" />
          <h2>Join SkillSwap</h2>
          <p>Start with 10 free time credits. Exchange skills with thousands of community members across India.</p>

          {/* Step progress */}
          <div className="reg-steps-sidebar">
            {STEPS.map((s) => (
              <div key={s.num} className={`rs-item ${step === s.num ? 'active' : step > s.num ? 'done' : ''}`}>
                <div className="rs-circle">
                  {step > s.num ? '✓' : s.icon}
                </div>
                <div className="rs-text">
                  <div className="rs-label">Step {s.num}</div>
                  <div className="rs-title">{s.label}</div>
                </div>
                {s.num < STEPS.length && <div className="rs-connector" />}
              </div>
            ))}
          </div>

          {/* Preview card — shows as user fills form */}
          {form.name && (
            <div className="reg-preview-card">
              <div className="rpc-avatar">{initials}</div>
              <div>
                <div className="rpc-name">{form.name || 'Your Name'}</div>
                {uploadedFile && (
                  <div className="rpc-verified">
                    <span>✅</span> Certificate Uploaded
                  </div>
                )}
                <div className="rpc-meta">🎓 {form.skillsOffered.length} skill{form.skillsOffered.length !== 1 ? 's' : ''} to teach</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="reg-form-side">
        <div className="reg-form-wrap">
          <Link to="/" className="reg-back">← Back to Home</Link>

          {/* Step indicator pill */}
          <div className="reg-step-pill">Step {step} of {STEPS.length} — {STEPS[step-1].label}</div>

          <h1 className="reg-title">{STEPS[step-1].label}</h1>
          <p className="reg-subtitle">
            {step === 1 && 'Set up your SkillSwap account credentials'}
            {step === 2 && 'Tell us what skills you can teach and upload your certificate'}
            {step === 3 && 'What skills do you want to learn?'}
          </p>

          {/* ── STEP 1: Account Info ── */}
          {step === 1 && (
            <div className="reg-form-body">
              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input type="text" className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Mahendra Kumar" value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))} autoFocus />
                {errors.name && <span className="field-error">⚠ {errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="req">*</span></label>
                <input type="email" className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="your@email.com" value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))} />
                {errors.email && <span className="field-error">⚠ {errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password <span className="req">*</span></label>
                <div className="input-eye">
                  <input type={showPass ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Minimum 6 characters" value={form.password}
                    onChange={e => setForm(p => ({...p, password: e.target.value}))} />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="password-strength">
                    <div className="ps-bars">
                      {[1,2,3,4].map(n => (
                        <div key={n} className={`ps-bar ${passwordStrength.score >= n ? `ps-${passwordStrength.color}` : ''}`} />
                      ))}
                    </div>
                    <span className={`ps-label ps-text-${passwordStrength.color}`}>{passwordStrength.label}</span>
                  </div>
                )}
                {errors.password && <span className="field-error">⚠ {errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password <span className="req">*</span></label>
                <div className="input-eye">
                  <input type={showConfirm ? 'text' : 'password'}
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Repeat your password" value={form.confirmPassword}
                    onChange={e => setForm(p => ({...p, confirmPassword: e.target.value}))} />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <span style={{color:'var(--success)',fontSize:'0.8rem',fontWeight:600}}>✅ Passwords match</span>
                )}
                {errors.confirmPassword && <span className="field-error">⚠ {errors.confirmPassword}</span>}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label className="form-label">Location (optional)</label>
                  <input type="text" className="form-input" placeholder="Salem, Tamil Nadu"
                    value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio (optional)</label>
                  <input type="text" className="form-input" placeholder="Short intro about you"
                    value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} />
                </div>
              </div>

              <button type="button" className="btn btn-primary btn-lg w-full reg-next-btn" onClick={goNext}>
                Continue to Skills →
              </button>
            </div>
          )}

          {/* ── STEP 2: Skills + Certificate ── */}
          {step === 2 && (
            <div className="reg-form-body">
              {/* Skills I Teach */}
              <div className="form-group">
                <label className="form-label">Skills I Can Teach <span className="req">*</span></label>
                <div className="skill-add-row">
                  <input type="text" className="form-input" placeholder="Type a skill and press Enter or click Add"
                    value={skillInput.offered}
                    onChange={e => setSkillInput(p => ({...p, offered: e.target.value}))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('offered', skillInput.offered); }}} />
                  <button type="button" className="btn btn-primary btn-sm add-skill-btn"
                    onClick={() => addSkill('offered', skillInput.offered)}>+ Add</button>
                </div>
                {errors.skillsOffered && <span className="field-error">⚠ {errors.skillsOffered}</span>}

                {/* Quick suggestions */}
                <div className="skill-suggestions-label">Quick add:</div>
                <div className="skill-chips-row">
                  {SKILL_SUGGESTIONS.filter(s => !form.skillsOffered.find(o => o.name === s)).slice(0, 8).map(s => (
                    <button key={s} type="button" className="skill-suggest-chip"
                      onClick={() => addSkill('offered', s)}>{s} +</button>
                  ))}
                </div>

                {/* Added skills */}
                {form.skillsOffered.length > 0 && (
                  <div className="added-skills">
                    <div className="added-label">Your teaching skills:</div>
                    <div className="skill-tags-wrap">
                      {form.skillsOffered.map((s, i) => (
                        <span key={i} className="skill-tag-pill offered">
                          🎓 {s.name}
                          <button type="button" onClick={() => removeSkill('offered', s.name)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Upload */}
              <div className="certificate-section">
                <div className="cert-header">
                  <div className="cert-title">
                    <span className="cert-icon">📜</span>
                    <div>
                      <h3>Proof of Skill</h3>
                      <p>Upload certificate to get a Verified badge on your profile</p>
                    </div>
                  </div>
                  <span className="cert-optional-badge">Optional</span>
                </div>

                {/* Upload zone */}
                {uploadState === 'idle' || uploadState === 'error' ? (
                  <div
                    ref={dropZoneRef}
                    className={`upload-drop-zone ${isDragging ? 'dragging' : ''} ${uploadState === 'error' ? 'upload-error-zone' : ''}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" hidden
                      accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                      onChange={onFileChange} />
                    <div className="dz-icon">{isDragging ? '📂' : '☁️'}</div>
                    <div className="dz-text">
                      {isDragging
                        ? <><strong>Drop it here!</strong></>
                        : <><strong>Drag & drop</strong> your certificate here</>
                      }
                    </div>
                    <div className="dz-sub">or <span className="dz-browse">browse files</span></div>
                    <div className="dz-formats">
                      <span className="fmt-pill">📄 PDF</span>
                      <span className="fmt-pill">🖼 JPG</span>
                      <span className="fmt-pill">🖼 PNG</span>
                      <span className="fmt-size">Max 5MB</span>
                    </div>
                    {uploadState === 'error' && (
                      <div className="dz-error-msg">Upload failed — click to try again</div>
                    )}
                  </div>
                ) : null}

                {/* Upload progress */}
                {uploadState === 'uploading' && (
                  <div className="upload-progress-wrap">
                    <div className="up-icon">⬆️</div>
                    <div className="up-content">
                      <div className="up-label">Uploading certificate...</div>
                      <div className="up-bar-track">
                        <div className="up-bar-fill" style={{width:`${uploadProgress}%`}} />
                      </div>
                      <div className="up-pct">{uploadProgress}%</div>
                    </div>
                  </div>
                )}

                {/* Upload success */}
                {uploadState === 'done' && uploadedFile && (
                  <div className="upload-success-card">
                    <div className="usc-left">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Certificate preview" className="usc-img-preview" />
                      ) : (
                        <div className="usc-file-icon">{getFileIcon(uploadedFile.mimetype)}</div>
                      )}
                    </div>
                    <div className="usc-info">
                      <div className="usc-verified-badge">✅ Verified Badge Earned!</div>
                      <div className="usc-filename">{uploadedFile.originalName}</div>
                      <div className="usc-size">{uploadedFile.sizeFormatted || formatSize(uploadedFile.size)}</div>
                    </div>
                    <button type="button" className="usc-remove" onClick={removeUpload} title="Remove certificate">✕</button>
                  </div>
                )}

                <div className="cert-hint">
                  💡 Uploading a certificate increases trust and gets more session requests
                </div>
              </div>

              <div className="reg-btn-row">
                <button type="button" className="btn btn-outline" onClick={goBack}>← Back</button>
                <button type="button" className="btn btn-primary btn-lg reg-next-btn" style={{flex:1}} onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Skills Wanted + Submit ── */}
          {step === 3 && (
            <div className="reg-form-body">
              <div className="form-group">
                <label className="form-label">Skills I Want to Learn</label>
                <div className="skill-add-row">
                  <input type="text" className="form-input" placeholder="Type a skill and press Enter or click Add"
                    value={skillInput.wanted}
                    onChange={e => setSkillInput(p => ({...p, wanted: e.target.value}))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('wanted', skillInput.wanted); }}} />
                  <button type="button" className="btn btn-primary btn-sm add-skill-btn"
                    onClick={() => addSkill('wanted', skillInput.wanted)}>+ Add</button>
                </div>

                <div className="skill-chips-row" style={{marginTop:8}}>
                  {SKILL_SUGGESTIONS.filter(s => !form.skillsWanted.find(o => o.name === s)).slice(0, 8).map(s => (
                    <button key={s} type="button" className="skill-suggest-chip want"
                      onClick={() => addSkill('wanted', s)}>{s} +</button>
                  ))}
                </div>

                {form.skillsWanted.length > 0 && (
                  <div className="added-skills">
                    <div className="added-label">You want to learn:</div>
                    <div className="skill-tags-wrap">
                      {form.skillsWanted.map((s, i) => (
                        <span key={i} className="skill-tag-pill wanted">
                          🌱 {s.name}
                          <button type="button" onClick={() => removeSkill('wanted', s.name)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary card */}
              <div className="reg-summary-card">
                <h4>📋 Your Registration Summary</h4>
                <div className="rsc-rows">
                  <div className="rsc-row"><span>Name</span><strong>{form.name}</strong></div>
                  <div className="rsc-row"><span>Email</span><strong>{form.email}</strong></div>
                  <div className="rsc-row"><span>Teaching</span>
                    <strong>{form.skillsOffered.length > 0 ? form.skillsOffered.map(s=>s.name).join(', ') : '—'}</strong>
                  </div>
                  <div className="rsc-row"><span>Learning</span>
                    <strong>{form.skillsWanted.length > 0 ? form.skillsWanted.map(s=>s.name).join(', ') : '—'}</strong>
                  </div>
                  <div className="rsc-row">
                    <span>Certificate</span>
                    <strong>
                      {uploadedFile
                        ? <span style={{color:'var(--success)'}}>✅ Uploaded — Verified</span>
                        : <span style={{color:'var(--text-muted)'}}>Not uploaded</span>
                      }
                    </strong>
                  </div>
                  <div className="rsc-row"><span>Welcome Credits</span><strong style={{color:'#d97706'}}>⏰ 10 free credits</strong></div>
                </div>
              </div>

              <div className="reg-btn-row">
                <button type="button" className="btn btn-outline" onClick={goBack}>← Back</button>
                <button type="button" className="btn btn-primary btn-lg reg-next-btn" style={{flex:1}}
                  onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <span className="reg-loading"><span className="reg-spinner" /> Creating Account...</span>
                    : '🎉 Create My Account'
                  }
                </button>
              </div>

              <p className="reg-terms">
                By registering, you agree to our <a href="#!">Terms of Service</a> and <a href="#!">Privacy Policy</a>.
              </p>
            </div>
          )}

          <p className="reg-signin">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Password strength helper ──────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'gray' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: 'red' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'orange' };
  if (score === 3) return { score: 3, label: 'Good', color: 'blue' };
  return { score: 4, label: 'Strong', color: 'green' };
}
