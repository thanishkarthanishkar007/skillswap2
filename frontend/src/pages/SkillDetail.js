import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isMockMode, mockGetSkill } from '../utils/mockData';
import { MdStar, MdLocationOn, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';

const CATEGORY_EMOJIS = {
  Technology:'💻',Design:'🎨',Music:'🎵',Cooking:'🍳',Education:'📚',
  Fitness:'💪',Language:'🌐','Arts & Crafts':'🎭',Business:'💼',Other:'🔮'
};

export default function SkillDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkill = async () => {
      try {
        if (isMockMode()) {
          const s = mockGetSkill(id);
          if (!s) { toast.error('Skill not found'); navigate('/marketplace'); return; }
          setSkill(s);
          return;
        }
        const res = await api.get(`/skills/${id}`);
        setSkill(res.data.skill);
      } catch {
        const s = mockGetSkill(id);
        if (s) setSkill(s);
        else { toast.error('Skill not found'); navigate('/marketplace'); }
      } finally {
        setLoading(false);
      }
    };
    loadSkill();
  }, [id, navigate]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!skill) return (
    <div className="empty-state">
      <div className="empty-icon">😕</div><h3>Skill not found</h3>
      <Link to="/marketplace" className="btn btn-primary" style={{marginTop:12}}>Back to Marketplace</Link>
    </div>
  );

  const avgRating = skill.totalRatings > 0 ? (skill.rating / skill.totalRatings).toFixed(1) : null;
  const emoji = CATEGORY_EMOJIS[skill.category] || '🔮';
  const uid = user?.id || user?._id;
  const isOwner = uid === (skill.provider?._id || skill.provider?.id);

  return (
    <div style={{maxWidth:800, margin:'0 auto'}}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{marginBottom:20}}>
        <MdArrowBack /> Back
      </button>

      <div className="card">
        <div style={{background:'linear-gradient(135deg,#ede9fe 0%,#e0f2fe 100%)',padding:'32px 32px 24px',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <div style={{width:72,height:72,borderRadius:18,background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',boxShadow:'var(--shadow)'}}>
                {emoji}
              </div>
              <div>
                <div style={{display:'flex',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                  <span className="badge badge-primary">{skill.category}</span>
                  {skill.isOnline && <span className="badge badge-success">🌐 Online</span>}
                </div>
                <h1 style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>
                  {skill.title}
                </h1>
                {avgRating && (
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    <MdStar style={{color:'#f59e0b'}} />
                    <span style={{fontWeight:700}}>{avgRating}</span>
                    <span style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>({skill.totalRatings} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="credit-chip" style={{fontSize:'1rem',padding:'8px 18px'}}>
                ⏰ {skill.timeCreditsPerHour} credit{skill.timeCreditsPerHour !== 1 ? 's' : ''}/hr
              </div>
              <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:6}}>
                {skill.totalSessions} sessions completed
              </div>
            </div>
          </div>
        </div>

        <div className="card-body" style={{padding:32}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:32}}>
            <div>
              <h3 style={{fontWeight:800,marginBottom:10}}>About this Skill</h3>
              <p style={{color:'var(--text-muted)',lineHeight:1.7,marginBottom:24}}>{skill.description}</p>

              {skill.tags?.length > 0 && (
                <div style={{marginBottom:24}}>
                  <h4 style={{fontWeight:700,marginBottom:8,fontSize:'0.875rem'}}>Tags</h4>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {skill.tags.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
                  </div>
                </div>
              )}

              {skill.availability?.length > 0 && (
                <div>
                  <h4 style={{fontWeight:700,marginBottom:8,fontSize:'0.875rem'}}>Availability</h4>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                    {skill.availability.map((a,i) => (
                      <div key={i} style={{padding:'6px 12px',background:'#f8fafc',borderRadius:8,fontSize:'0.82rem',fontWeight:600}}>
                        {a.day}: {a.from}–{a.to}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="card" style={{marginBottom:16,border:'2px solid var(--border)'}}>
                <div className="card-body">
                  <h4 style={{fontWeight:800,marginBottom:14}}>About the Provider</h4>
                  <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
                    <div style={{width:48,height:48,borderRadius:'50%',flexShrink:0,background:'var(--grad-primary)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1.1rem',overflow:'hidden'}}>
                      {skill.provider?.avatar
                        ? <img src={skill.provider.avatar} alt={skill.provider.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        : skill.provider?.name?.[0]?.toUpperCase()
                      }
                    </div>
                    <div>
                      <div style={{fontWeight:800}}>{skill.provider?.name}</div>
                      <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{skill.provider?.totalExchanges || 0} exchanges</div>
                    </div>
                  </div>
                  {skill.provider?.bio && (
                    <p style={{fontSize:'0.82rem',color:'var(--text-muted)',lineHeight:1.5,marginBottom:10}}>
                      {skill.provider.bio}
                    </p>
                  )}
                  {skill.location && (
                    <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.82rem',color:'var(--text-muted)'}}>
                      <MdLocationOn /> {skill.location}
                    </div>
                  )}
                </div>
              </div>

              {user && !isOwner && skill.isActive && (
                <Link to={`/request/${skill._id}`} className="btn btn-primary btn-lg w-full">
                  📅 Request Session
                </Link>
              )}
              {isOwner && (
                <div className="badge badge-info" style={{width:'100%',justifyContent:'center',padding:'12px'}}>
                  This is your skill listing
                </div>
              )}
              {!user && (
                <Link to="/login" className="btn btn-primary btn-lg w-full">Sign in to Book</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
