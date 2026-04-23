import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      backgroundColor: '#fff', borderBottom: '1px solid #eee',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px'
      }}>
        {/* 로고 */}
        <div onClick={() => navigate('/')} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{width: '32px', height: '32px', backgroundColor: '#5c6bc0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{color: '#fff', fontWeight: '700', fontSize: '16px'}}>B</span>
          </div>
          <span style={{fontSize: '18px', fontWeight: '700', color: '#3f3f3f'}}>Board</span>
        </div>

        {/* 데스크탑 메뉴 */}
        <div style={{display: 'flex', alignItems: 'center', gap: '24px'}} className="desktop-menu">
          <span onClick={() => navigate('/')} style={{cursor: 'pointer', color: '#666', fontWeight: '500', fontSize: '15px'}}>홈</span>
          <span onClick={() => navigate('/posts/new')} style={{cursor: 'pointer', color: '#666', fontWeight: '500', fontSize: '15px'}}>글쓰기</span>
          <button onClick={() => navigate('/login')} style={{
            backgroundColor: '#5c6bc0', color: '#fff',
            padding: '8px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px'
          }}>
            로그인
          </button>
        </div>

        {/* 햄버거 메뉴 (모바일) */}
        <div onClick={() => setMenuOpen(!menuOpen)} style={{cursor: 'pointer', display: 'none'}} className="hamburger">
          <div style={{width: '24px', height: '2px', backgroundColor: '#333', marginBottom: '5px'}}></div>
          <div style={{width: '24px', height: '2px', backgroundColor: '#333', marginBottom: '5px'}}></div>
          <div style={{width: '24px', height: '2px', backgroundColor: '#333'}}></div>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div style={{
          backgroundColor: '#fff', borderTop: '1px solid #eee',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <span onClick={() => { navigate('/'); setMenuOpen(false); }} style={{cursor: 'pointer', color: '#666', fontWeight: '500'}}>홈</span>
          <span onClick={() => { navigate('/posts/new'); setMenuOpen(false); }} style={{cursor: 'pointer', color: '#666', fontWeight: '500'}}>글쓰기</span>
          <button onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{
            backgroundColor: '#5c6bc0', color: '#fff',
            padding: '8px 20px', borderRadius: '8px', fontWeight: '600', width: 'fit-content'
          }}>
            로그인
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;