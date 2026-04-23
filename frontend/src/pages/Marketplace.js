import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isMockMode, mockGetSkills, mockGetUsers, mockCreateSkill } from '../utils/mockData';
import { MdSearch, MdFilterList, MdStar, MdPerson, MdSchool, MdAccessTime, MdClose } from 'react-icons/md';
import './Marketplace.css';

const CATEGORIES = ['All','Technology','Design','Music','Cooking','Education','Fitness','Language','Arts & Crafts','Business','Other'];
const CATEGORY_EMOJIS = {
  Technology:'💻', Design:'🎨', Music:'🎵', Cooking:'🍳', Education:'📚',
  Fitness:'💪', Language:'🌐', 'Arts & Crafts':'🎭', Business:'💼', Other:'🔮'
};
const SORT_OPTIONS = [
  { value: '-createdAt',          label: 'Newest' },
  { value: '-rating',             label: 'Highest Rated' },
  { value: 'timeCreditsPerHour',  label: 'Lowest Credits' },
  { value: '-timeCreditsPerHour', label: 'Highest Credits' },
];

export default function Marketplace() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState('skills');

  /* ── Skills state ─────────────────────────────────────────── */
  const [skills,      setSkills]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [pages,       setPages]       = useState(1);
  const [filters,     setFilters]     = useState({ search: '', category: '', sort: '-createdAt', page: 1 });
  const [searchInput, setSearchInput] = useState('');

  /* ── People state ─────────────────────────────────────────── */
  const [people,         setPeople]         = useState([]);
  const [peopleLoading,  setPeopleLoading]  = useState(false);
  const [peopleSearch,   setPeopleSearch]   = useState('');
  const [peopleInput,    setPeopleInput]    = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  /* ── Fetch skills ─────────────────────────────────────────── */
  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      if (isMockMode()) {
        const r = mockGetSkills({ search: filters.search, category: filters.category, sort: filters.sort, page: filters.page, limit: 12 });
        setSkills(r.skills); setTotal(r.total); setPages(r.pages);
        return;
      }
      const params = new URLSearchParams({
        page: filters.page, limit: 12, sort: filters.sort,
        ...(filters.category && filters.category !== 'All' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });
      const res = await api.get(`/skills?${params}`);
      setSkills(res.data.skills); setTotal(res.data.total); setPages(res.data.pages);
    } catch {
      const r = mockGetSkills({ search: filters.search, category: filters.category, sort: filters.sort, page: filters.page, limit: 12 });
      setSkills(r.skills); setTotal(r.total); setPages(r.pages);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  /* ── Fetch people ─────────────────────────────────────────── */
  const fetchPeople = useCallback(async () => {
    setPeopleLoading(true);
    try {
      if (isMockMode()) {
        setPeople(mockGetUsers(peopleSearch));
        return;
      }
      const res = await api.get(`/users?search=${encodeURIComponent(peopleSearch)}&limit=24`);
      setPeople(res.data.users || []);
    } catch {
      setPeople(mockGetUsers(peopleSearch));
    } finally {
      setPeopleLoading(false);
    }
  }, [peopleSearch]);

  useEffect(() => {
    if (activeTab === 'people') fetchPeople();
  }, [activeTab, fetchPeople]);

  const handleSkillSearch  = (e) => { e.preventDefault(); setFilters(p => ({ ...p, search: searchInput, page: 1 })); };
  const handlePeopleSearch = (e) => { e.preventDefault(); setPeopleSearch(peopleInput); };
  const setCategory = (cat) => setFilters(p => ({ ...p, category: cat === 'All' ? '' : cat, page: 1 }));

  const currentUserId = user?.id || user?._id;

  return (
    <div className="marketplace">
      <div className="page-header">
        <h1>Skill Marketplace</h1>
        <p>Discover skills and people in the community. Use time credits to book sessions.</p>
      </div>

      {/* ── Tab switcher ──────────────────────────────────────── */}
      <div className="mkt-tabs">
        <button className={`mkt-tab ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
          <MdSchool className="mkt-tab-icon" /> Browse Skills
        </button>
        <button className={`mkt-tab ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>
          <MdPerson className="mkt-tab-icon" /> Find People
        </button>
      </div>

      {/* ════════════ SKILLS TAB ════════════ */}
      {activeTab === 'skills' && (
        <>
          <div className="market-bar">
            <form className="search-form" onSubmit={handleSkillSearch}>
              <MdSearch className="search-icon" />
              <input type="text" placeholder="Search skills by name, tag, description..."
                className="search-input" value={searchInput}
                onChange={e => setSearchInput(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            <div className="sort-wrap">
              <MdFilterList />
              <select className="form-select" value={filters.sort}
                onChange={e => setFilters(p => ({ ...p, sort: e.target.value, page: 1 }))}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="category-pills">
            {CATEGORIES.map(cat => (
              <button key={cat}
                className={`cat-pill ${(filters.category === cat || (!filters.category && cat === 'All')) ? 'active' : ''}`}
                onClick={() => setCategory(cat)}>
                {cat !== 'All' && (CATEGORY_EMOJIS[cat] || '🔮')} {cat}
              </button>
            ))}
          </div>

          <div className="results-info">
            {loading ? 'Loading...' : `${total} skill${total !== 1 ? 's' : ''} found`}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : skills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No skills found</h3>
              <p>Try different search terms or browse all categories</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }}
                onClick={() => { setFilters({ search: '', category: '', sort: '-createdAt', page: 1 }); setSearchInput(''); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="skills-grid">
              {skills.map(skill => (
                <SkillCard key={skill._id} skill={skill} currentUserId={currentUserId} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, page: p }))}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════ PEOPLE TAB ════════════ */}
      {activeTab === 'people' && (
        <>
          <div className="market-bar">
            <form className="search-form" style={{ flex: 1 }} onSubmit={handlePeopleSearch}>
              <MdSearch className="search-icon" />
              <input type="text" placeholder="Search by name, skill they teach, or location..."
                className="search-input" value={peopleInput}
                onChange={e => setPeopleInput(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
          </div>

          <div className="category-pills">
            {['Python','Guitar','Yoga','Cooking','Design','Spanish','React','Java'].map(tag => (
              <button key={tag} className="cat-pill"
                onClick={() => { setPeopleInput(tag); setPeopleSearch(tag); }}>
                🔍 {tag}
              </button>
            ))}
          </div>

          <div className="results-info">
            {peopleLoading ? 'Searching...' : `${people.length} member${people.length !== 1 ? 's' : ''} found`}
          </div>

          {peopleLoading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : people.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No members found</h3>
              <p>Try searching by name, skill, or location</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }}
                onClick={() => { setPeopleInput(''); setPeopleSearch(''); }}>
                Show All Members
              </button>
            </div>
          ) : (
            <div className="people-grid">
              {people.map(person => (
                <PersonCard
                  key={person._id || person.id}
                  person={person}
                  isMe={currentUserId === (person._id || person.id)}
                  onRequest={() => setSelectedPerson(person)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Request Session Modal ──────────────────────────────── */}
      {selectedPerson && (
        <RequestModal
          person={selectedPerson}
          marketplaceSkills={skills}
          currentUser={user}
          onClose={() => setSelectedPerson(null)}
          navigate={navigate}
          refreshSkills={fetchSkills}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKILL CARD — with direct Request button
   ══════════════════════════════════════════════════════════════ */
function SkillCard({ skill, currentUserId }) {
  const avgRating  = skill.totalRatings > 0 ? (skill.rating / skill.totalRatings).toFixed(1) : null;
  const emoji      = CATEGORY_EMOJIS[skill.category] || '🔮';
  const providerId = skill.provider?._id || skill.provider?.id;
  const isMySkill  = currentUserId && currentUserId === providerId;

  return (
    <div className="skill-card card card-hover">
      <div className="skill-card-header">
        <div className="skill-emoji-wrap">{emoji}</div>
        <span className="credit-chip">⏰ {skill.timeCreditsPerHour}/hr</span>
      </div>
      <div className="card-body">
        <div className="skill-category-tag">{skill.category}</div>
        <h3 className="skill-title">{skill.title}</h3>
        <p className="skill-desc">{skill.description?.slice(0, 90)}{skill.description?.length > 90 ? '…' : ''}</p>
        <hr className="divider" style={{ margin: '10px 0' }} />
        <div className="skill-footer">
          <div className="provider-info">
            <div className="provider-avatar">
              {skill.provider?.avatar
                ? <img src={skill.provider.avatar} alt={skill.provider?.name} />
                : <span>{skill.provider?.name?.[0]?.toUpperCase() || '?'}</span>}
            </div>
            <span className="provider-name">{skill.provider?.name}</span>
            {skill.provider?.isVerified && <span className="verified-chip">✅</span>}
          </div>
          <div className="skill-rating">
            {avgRating ? <><MdStar className="star-icon" /><span>{avgRating}</span></> : <span className="text-muted text-sm">New</span>}
          </div>
        </div>
        {skill.tags?.length > 0 && (
          <div className="skill-tags-row">
            {skill.tags.slice(0, 3).map(t => <span key={t} className="badge badge-gray">{t}</span>)}
          </div>
        )}
        <div className="skill-actions">
          <Link to={`/skills/${skill._id}`} className="btn btn-outline btn-sm skill-action-btn">View Details</Link>
          {isMySkill ? (
            <span className="mine-badge">Your skill</span>
          ) : (
            <Link to={`/request/${skill._id}`} className="btn btn-primary btn-sm skill-action-btn">📅 Request</Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PERSON CARD
   ══════════════════════════════════════════════════════════════ */
function PersonCard({ person, isMe, onRequest }) {
  const initials  = person.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avgRating = person.totalRatings > 0 ? (person.rating / person.totalRatings).toFixed(1) : null;

  return (
    <div className="person-card card">
      <div className="pc-top">
        <div className="pc-avatar-wrap">
          {person.avatar
            ? <img src={person.avatar} alt={person.name} className="pc-avatar-img" />
            : <div className="pc-avatar-initials">{initials}</div>}
          {person.isVerified && <span className="pc-verified-dot">✅</span>}
        </div>
        <div className="pc-meta">
          <div className="pc-name">{person.name}</div>
          {person.location && <div className="pc-location">📍 {person.location}</div>}
          <div className="pc-stats-row">
            {avgRating && <span className="pc-stat"><MdStar style={{ color: '#f59e0b', fontSize: '0.85rem' }} /> {avgRating}</span>}
            <span className="pc-stat">🤝 {person.totalExchanges || 0}</span>
            <span className="credit-chip" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>⏰ {person.timeCredits || 0}</span>
          </div>
        </div>
      </div>
      {person.bio && <p className="pc-bio">{person.bio.slice(0, 95)}{person.bio.length > 95 ? '…' : ''}</p>}
      {person.skillsOffered?.length > 0 && (
        <div className="pc-skills-block">
          <div className="pc-skills-label">🎓 Teaches</div>
          <div className="pc-chips">
            {person.skillsOffered.slice(0, 4).map((s, i) => <span key={i} className="pc-chip offered">{s.name}</span>)}
            {person.skillsOffered.length > 4 && <span className="pc-chip more">+{person.skillsOffered.length - 4}</span>}
          </div>
        </div>
      )}
      {person.skillsWanted?.length > 0 && (
        <div className="pc-skills-block">
          <div className="pc-skills-label">🌱 Wants to learn</div>
          <div className="pc-chips">
            {person.skillsWanted.slice(0, 3).map((s, i) => <span key={i} className="pc-chip wanted">{s.name}</span>)}
          </div>
        </div>
      )}
      <div className="pc-actions">
        {isMe ? (
          <Link to="/profile" className="btn btn-outline btn-sm w-full">Edit My Profile</Link>
        ) : person.skillsOffered?.length > 0 ? (
          <button className="btn btn-primary btn-sm w-full" onClick={onRequest}>📅 Request Session</button>
        ) : (
          <div className="no-skills-note">No skills listed yet</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REQUEST MODAL — FIX: auto-creates skill listing if missing
   ══════════════════════════════════════════════════════════════ */
function RequestModal({ person, marketplaceSkills, currentUser, onClose, navigate, refreshSkills }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [creating,      setCreating]      = useState(false);

  const personId = person._id || person.id;

  // Skills this person already has in the marketplace
  const listedSkills = marketplaceSkills.filter(s => {
    const pid = s.provider?._id || s.provider?.id;
    return pid === personId;
  });

  const listedTitles = new Set(listedSkills.map(s => s.title.toLowerCase()));

  // Skills from their profile NOT yet in marketplace — we'll auto-create them
  const profileOnlySkills = (person.skillsOffered || []).filter(
    s => !listedTitles.has(s.name?.toLowerCase())
  );

  // Combined list — every skill the person can teach
  const allOptions = [
    ...listedSkills.map(s => ({
      id: s._id,
      name: s.title,
      credits: s.timeCreditsPerHour,
      needsCreate: false,
    })),
    ...profileOnlySkills.map(s => ({
      id: null,
      name: s.name,
      credits: s.timeCreditsPerHour || 1,
      category: s.category || 'Other',
      description: s.description || `Learn ${s.name} from ${person.name}`,
      needsCreate: true,   // ← This is the fix: will create skill page on demand
    })),
  ];

  const selectedOption = selectedIndex !== null ? allOptions[selectedIndex] : null;

  const handleBook = async () => {
    if (!selectedOption) return;
    setCreating(true);

    try {
      let skillId = selectedOption.id;

      // ── FIX: If no marketplace listing exists, create one on-the-fly ──
      if (selectedOption.needsCreate) {
        if (isMockMode()) {
          const newSkill = mockCreateSkill(personId, {
            title:              selectedOption.name,
            description:        selectedOption.description,
            category:           selectedOption.category,
            timeCreditsPerHour: selectedOption.credits,
            tags:               [selectedOption.name.toLowerCase()],
            isOnline:           true,
          });
          skillId = newSkill._id;
          refreshSkills(); // refresh marketplace listing
        } else {
          // Real backend: create skill under the provider's account
          // (requires admin token or we use a special endpoint)
          // For now navigate to a request with person info in state
          onClose();
          navigate('/exchanges', {
            state: {
              requestPerson: person,
              requestSkill:  selectedOption.name,
            }
          });
          return;
        }
      }

      onClose();
      navigate(`/request/${skillId}`);
    } catch (err) {
      console.error('Could not book skill:', err);
      setCreating(false);
    }
  };

  const initials = person.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="request-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="rm-header">
          <div className="rm-avatar">
            {person.avatar ? <img src={person.avatar} alt={person.name} /> : <span>{initials}</span>}
          </div>
          <div className="rm-header-info">
            <div className="rm-name">Request Session with {person.name}</div>
            <div className="rm-sub">
              {person.location && `📍 ${person.location} · `}
              🤝 {person.totalExchanges || 0} exchanges
            </div>
          </div>
          <button className="rm-close-btn" onClick={onClose}><MdClose /></button>
        </div>

        {/* Body */}
        <div className="rm-body">
          {allOptions.length === 0 ? (
            <div className="rm-empty">
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>😕</div>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>No skills listed yet</p>
              <p className="text-muted" style={{ fontSize: '0.82rem' }}>
                This member hasn't added any skills to their profile yet.
              </p>
            </div>
          ) : (
            <>
              <label className="form-label" style={{ marginBottom: 10 }}>
                Which skill do you want to learn? *
              </label>
              <div className="rm-skill-list">
                {allOptions.map((opt, i) => (
                  <label
                    key={i}
                    className={`rm-skill-row ${selectedIndex === i ? 'selected' : ''}`}
                    onClick={() => setSelectedIndex(i)}
                  >
                    <input
                      type="radio"
                      name="requestSkill"
                      checked={selectedIndex === i}
                      onChange={() => setSelectedIndex(i)}
                    />
                    <div className="rm-skill-info">
                      <span className="rm-skill-name">{opt.name}</span>
                      {opt.needsCreate && (
                        <span className="rm-skill-badge">Will create booking page</span>
                      )}
                    </div>
                    <span className="credit-chip" style={{ fontSize: '0.78rem' }}>
                      ⏰ {opt.credits}/hr
                    </span>
                  </label>
                ))}
              </div>

              {selectedOption && (
                <div className="rm-balance-row">
                  <MdAccessTime />
                  <span>Your balance: <strong>{currentUser?.timeCredits || 0} credits</strong></span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="rm-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={selectedIndex === null || allOptions.length === 0 || creating}
            onClick={handleBook}
          >
            {creating ? 'Setting up…' : 'Continue to Book →'}
          </button>
        </div>
      </div>
    </div>
  );
}
