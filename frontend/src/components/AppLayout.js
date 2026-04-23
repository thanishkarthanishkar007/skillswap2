import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { isMockMode, mockGetNotifications, mockMarkAllRead } from '../utils/mockData';
import logo from '../logo.png';
import {
  MdDashboard, MdStore, MdSwapHoriz, MdPerson, MdNotifications,
  MdAdminPanelSettings, MdLogout, MdMenu, MdClose, MdAccessTime
} from 'react-icons/md';
import './AppLayout.css';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => { setSidebarOpen(false); setNotifOpen(false); }, [location]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      if (isMockMode()) {
        const data = mockGetNotifications(user.id || user._id);
        setUnread(data.unreadCount);
        setNotifications(data.notifications);
        return;
      }
      const res = await api.get('/notifications');
      setUnread(res.data.unreadCount);
      setNotifications(res.data.notifications);
    } catch {
      if (user) {
        const data = mockGetNotifications(user.id || user._id);
        setUnread(data.unreadCount);
        setNotifications(data.notifications);
      }
    }
  };

  const markAllRead = async () => {
    if (isMockMode()) {
      mockMarkAllRead(user.id || user._id);
    } else {
      try { await api.put('/notifications/read-all'); } catch {
        mockMarkAllRead(user.id || user._id);
      }
    }
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/marketplace', icon: <MdStore />, label: 'Marketplace' },
    { to: '/exchanges', icon: <MdSwapHoriz />, label: 'My Exchanges' },
    { to: '/profile', icon: <MdPerson />, label: 'Profile' },
  ];
  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: <MdAdminPanelSettings />, label: 'Admin Panel' });
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="SkillSwap" className="sidebar-logo" />
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><MdClose /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="credit-display">
            <MdAccessTime className="credit-icon" />
            <div>
              <div className="credit-label">Time Credits</div>
              <div className="credit-value">{user?.timeCredits ?? 0} hrs</div>
            </div>
          </div>
          <button className="btn btn-ghost w-full logout-btn" onClick={handleLogout}>
            <MdLogout /> Sign Out
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}><MdMenu /></button>
          <div className="topbar-logo">
            <img src={logo} alt="SkillSwap" />
          </div>
          <div className="topbar-right">
            <div className="notif-wrapper">
              <button className="notif-btn" onClick={() => setNotifOpen(o => !o)}>
                <MdNotifications />
                {unread > 0 && <span className="notif-badge">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    {unread > 0 && (
                      <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0
                      ? <div className="notif-empty">No notifications yet</div>
                      : notifications.slice(0, 8).map(n => (
                          <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-msg">{n.message}</div>
                            <div className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="user-chip" onClick={() => navigate('/profile')}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="user-avatar" />
                : <div className="user-initials">{initials}</div>
              }
              <span className="user-name">{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
