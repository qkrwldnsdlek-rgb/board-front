import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import { supabase } from '../supabase';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ todayVisit: 0, totalPosts: 0 });
  const [user, setUser] = useState(null);

  const currentCategory = location.pathname === '/' 
  ? (new URLSearchParams(location.search).get('category') || '전체')
  : '';

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleCategory = (cat) => {
    if (cat === '전체') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(cat)}`);
    }
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div onClick={onClose} style={{
          position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998
        }} className="sidebar-overlay" />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: '#fff',
        borderRight: '1px solid #eee',
        padding: '24px 16px',
        position: 'fixed',
        top: '60px',
        left: 0,
        zIndex: 999,
      }}>
        <div style={{marginBottom: '32px'}}>
          <p style={{fontSize: '11px', fontWeight: '700', color: '#bbb', letterSpacing: '1px', marginBottom: '12px'}}>MENU</p>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li onClick={() => { navigate('/'); onClose(); }} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
              color: location.pathname === '/' ? '#5c6bc0' : '#444',
              fontWeight: location.pathname === '/' ? '700' : '500',
              fontSize: '14px', marginBottom: '4px',
              backgroundColor: location.pathname === '/' ? '#f0f2ff' : 'transparent'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
              onMouseLeave={e => e.currentTarget.style.background = location.pathname === '/' ? '#f0f2ff' : 'transparent'}
            >
              🏠 홈
            </li>
            {user && (
              <li onClick={() => { navigate('/mypage'); onClose(); }} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                color: location.pathname === '/mypage' ? '#5c6bc0' : '#444',
                fontWeight: location.pathname === '/mypage' ? '700' : '500',
                fontSize: '14px', marginBottom: '4px',
                backgroundColor: location.pathname === '/mypage' ? '#f0f2ff' : 'transparent'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
                onMouseLeave={e => e.currentTarget.style.background = location.pathname === '/mypage' ? '#f0f2ff' : 'transparent'}
              >
                👤 마이페이지
              </li>
            )}


            {user?.email === 'qkrwldnsdlek@gmail.com' && (
              <li onClick={() => { navigate('/admin'); onClose(); }} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                color: location.pathname === '/admin' ? '#5c6bc0' : '#444',
                fontWeight: location.pathname === '/admin' ? '700' : '500',
                fontSize: '14px', marginBottom: '4px',
                backgroundColor: location.pathname === '/admin' ? '#f0f2ff' : 'transparent'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
                onMouseLeave={e => e.currentTarget.style.background = location.pathname === '/admin' ? '#f0f2ff' : 'transparent'}
              >
                🛠️ 관리자
              </li>
            )}


          </ul>
        </div>

        <div style={{marginBottom: '32px'}}>
          <p style={{fontSize: '11px', fontWeight: '700', color: '#bbb', letterSpacing: '1px', marginBottom: '12px'}}>CATEGORY</p>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            {['전체', '공지사항', '자유게시판', '질문'].map((cat) => (
              <li key={cat}
                onClick={() => handleCategory(cat)}
                style={{
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  color: currentCategory === cat ? '#5c6bc0' : '#444',
                  fontWeight: currentCategory === cat ? '700' : '500',
                  fontSize: '14px', marginBottom: '4px',
                  backgroundColor: currentCategory === cat ? '#f0f2ff' : 'transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
                onMouseLeave={e => e.currentTarget.style.background = currentCategory === cat ? '#f0f2ff' : 'transparent'}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>

        <div style={{backgroundColor: '#f8f9ff', borderRadius: '12px', padding: '16px'}}>
          <p style={{fontSize: '11px', fontWeight: '700', color: '#bbb', letterSpacing: '1px', marginBottom: '12px'}}>STATS</p>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{fontSize: '13px', color: '#888'}}>전체 게시글</span>
            <span style={{fontSize: '13px', fontWeight: '700', color: '#5c6bc0'}}>{stats.totalPosts}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{fontSize: '13px', color: '#888'}}>오늘 방문</span>
            <span style={{fontSize: '13px', fontWeight: '700', color: '#5c6bc0'}}>{stats.todayVisit}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;