import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isMockMode, mockGetExchanges, mockRespondExchange, mockCompleteExchange } from '../utils/mockData';
import toast from 'react-hot-toast';
import { MdCheck, MdClose, MdStar } from 'react-icons/md';
import './ExchangeTracking.css';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function statusColor(s) {
  return { pending:'warning', accepted:'info', active:'info', completed:'success', rejected:'danger', cancelled:'gray' }[s] || 'gray';
}

export default function ExchangeTracking() {
  const { user, updateUser } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '' });

  const uid = user?.id || user?._id;

  const fetchExchanges = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      if (isMockMode()) {
        setExchanges(mockGetExchanges(uid));
        return;
      }
      const res = await api.get('/exchanges/my');
      setExchanges(res.data.exchanges || []);
    } catch {
      setExchanges(mockGetExchanges(uid));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExchanges(); }, [uid]);

  const filtered = activeTab === 'all' ? exchanges : exchanges.filter(e => e.status === activeTab);

  const handleRespond = async (id, action) => {
    try {
      if (isMockMode()) {
        mockRespondExchange(id, action, uid);
        toast.success(`Exchange ${action}!`);
        fetchExchanges();
        return;
      }
      await api.put(`/exchanges/${id}/respond`, { action });
      toast.success(`Exchange ${action}!`);
      fetchExchanges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleComplete = async () => {
    try {
      if (isMockMode()) {
        const updated = mockCompleteExchange(ratingModal, ratingForm, uid);
        if (updated.status === 'completed') {
          updateUser({ timeCredits: (user.timeCredits || 0) + updated.timeCreditsAmount, totalExchanges: (user.totalExchanges || 0) + 1 });
        }
        toast.success('Session completed! Credits updated 🎉');
        setRatingModal(null);
        fetchExchanges();
        return;
      }
      await api.put(`/exchanges/${ratingModal}/complete`, ratingForm);
      toast.success('Session completed! Credits updated 🎉');
      setRatingModal(null);
      fetchExchanges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    }
  };

  const creditStats = {
    earned: exchanges.filter(e => e.status === 'completed' && e.provider?._id === uid)
                     .reduce((s, e) => s + e.timeCreditsAmount, 0),
    spent: exchanges.filter(e => e.status === 'completed' && e.learner?._id === uid)
                    .reduce((s, e) => s + e.timeCreditsAmount, 0),
  };

  return (
    <div className="exchange-tracking">
      <div className="page-header">
        <h1>My Exchanges</h1>
        <p>Track all your skill exchange sessions</p>
      </div>

      <div className="credit-summary">
        <div className="cs-card earned">
          <div className="cs-icon">⬆️</div>
          <div><div className="cs-value">+{creditStats.earned}</div><div className="cs-label">Credits Earned</div></div>
        </div>
        <div className="cs-card spent">
          <div className="cs-icon">⬇️</div>
          <div><div className="cs-value">-{creditStats.spent}</div><div className="cs-label">Credits Spent</div></div>
        </div>
        <div className="cs-card balance">
          <div className="cs-icon">⏰</div>
          <div><div className="cs-value">{user?.timeCredits || 0}</div><div className="cs-label">Current Balance</div></div>
        </div>
        <div className="cs-card total">
          <div className="cs-icon">🤝</div>
          <div><div className="cs-value">{user?.totalExchanges || 0}</div><div className="cs-label">Total Completed</div></div>
        </div>
      </div>

      <div className="exchange-tabs">
        {TABS.map(tab => {
          const count = tab.key === 'all' ? exchanges.length : exchanges.filter(e => e.status === tab.key).length;
          return (
            <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}>
              {tab.label} {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No exchanges here</h3>
          <p>{activeTab === 'all' ? 'Start by browsing the marketplace' : `No ${activeTab} exchanges`}</p>
        </div>
      ) : (
        <div className="exchanges-list">
          {filtered.map(ex => (
            <ExchangeCard key={ex._id} exchange={ex} userId={uid}
              onAccept={() => handleRespond(ex._id, 'accepted')}
              onReject={() => handleRespond(ex._id, 'rejected')}
              onComplete={() => setRatingModal(ex._id)} />
          ))}
        </div>
      )}

      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{fontFamily:'var(--font-display)',fontWeight:900,marginBottom:4}}>Complete Session</h3>
            <p style={{color:'var(--text-muted)',marginBottom:20,fontSize:'0.875rem'}}>Rate your experience</p>
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  style={{fontSize:'1.6rem',background:'none',border:'none',cursor:'pointer',opacity:ratingForm.rating>=s?1:0.3}}
                  onClick={() => setRatingForm(p => ({...p, rating: s}))}>⭐</button>
              ))}
            </div>
            <textarea className="form-textarea" rows={3} placeholder="Write a review (optional)"
              value={ratingForm.review} onChange={e => setRatingForm(p => ({...p, review: e.target.value}))} />
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button className="btn btn-outline" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn btn-success" style={{flex:1}} onClick={handleComplete}>
                <MdCheck /> Complete & Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExchangeCard({ exchange: ex, userId, onAccept, onReject, onComplete }) {
  const isProvider = ex.provider?._id === userId;
  const canRespond = isProvider && ex.status === 'pending';
  const canComplete = ex.status === 'accepted';
  return (
    <div className="exchange-card card">
      <div className="card-body">
        <div className="exc-header">
          <div className="exc-skill-info">
            <div className="exc-skill-icon">🎓</div>
            <div>
              <h4 className="exc-skill-title">{ex.skill?.title || 'Session'}</h4>
              <span className="badge badge-gray">{ex.skill?.category}</span>
            </div>
          </div>
          <span className={`badge badge-${statusColor(ex.status)}`} style={{textTransform:'capitalize'}}>
            {ex.status}
          </span>
        </div>
        <div className="exc-details">
          <div className="exc-detail-item">
            <span className="exc-detail-label">Teacher</span>
            <span className="exc-detail-value">{ex.provider?.name}</span>
          </div>
          <div className="exc-detail-item">
            <span className="exc-detail-label">Learner</span>
            <span className="exc-detail-value">{ex.learner?.name}</span>
          </div>
          <div className="exc-detail-item">
            <span className="exc-detail-label">Scheduled</span>
            <span className="exc-detail-value">
              {new Date(ex.scheduledDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
            </span>
          </div>
          <div className="exc-detail-item">
            <span className="exc-detail-label">Duration</span>
            <span className="exc-detail-value">{ex.duration} hr{ex.duration !== 1 ? 's' : ''}</span>
          </div>
          <div className="exc-detail-item">
            <span className="exc-detail-label">Credits</span>
            <span className="credit-chip">⏰ {ex.timeCreditsAmount}</span>
          </div>
          {ex.meetingLink && (
            <div className="exc-detail-item">
              <span className="exc-detail-label">Link</span>
              <a href={ex.meetingLink} target="_blank" rel="noreferrer" className="exc-link">Join Session →</a>
            </div>
          )}
        </div>
        {ex.notes && (
          <div className="exc-notes">
            <span style={{fontWeight:700,fontSize:'0.8rem'}}>Notes: </span>
            <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{ex.notes}</span>
          </div>
        )}
        {(canRespond || canComplete) && (
          <div className="exc-actions">
            {canRespond && (
              <>
                <button className="btn btn-success btn-sm" onClick={onAccept}><MdCheck /> Accept</button>
                <button className="btn btn-danger btn-sm" onClick={onReject}><MdClose /> Decline</button>
              </>
            )}
            {canComplete && (
              <button className="btn btn-primary btn-sm" onClick={onComplete}><MdStar /> Mark Complete & Rate</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
