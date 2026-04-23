import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#f0f4ff 0%,#f5f3ff 100%)',
      padding:24, textAlign:'center'
    }}>
      <div style={{fontSize:'6rem', marginBottom:16}}>😕</div>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:'3rem',fontWeight:900,color:'var(--text)',marginBottom:8}}>404</h1>
      <h2 style={{fontSize:'1.3rem',fontWeight:700,color:'var(--text)',marginBottom:8}}>Page Not Found</h2>
      <p style={{color:'var(--text-muted)',marginBottom:28,maxWidth:400}}>
        Looks like this page took a skill exchange break. Let's get you back home!
      </p>
      <Link to="/" className="btn btn-primary btn-lg">← Go Home</Link>
    </div>
  );
}
