import { useNavigate } from 'react-router-dom';

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      backgroundColor: '#fff', borderBottom: '1px solid #eee',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: '100%', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px'
      }}>
        {/* 로고 */}
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          {/* 햄버거 버튼 */}
          <div onClick={onMenuClick} className="hamburger" style={{
            cursor: 'pointer', padding: '4px', display: 'none', flexDirection: 'column', gap: '5px'
          }}>
            <div style={{width: '24px', height: '2px', backgroundColor: '#333'}}></div>
            <div style={{width: '24px', height: '2px', backgroundColor: '#333'}}></div>
            <div style={{width: '24px', height: '2px', backgroundColor: '#333'}}></div>
          </div>
          <div onClick={() => navigate('/')} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '32px', height: '32px', backgroundColor: '#5c6bc0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: '#fff', fontWeight: '700', fontSize: '16px'}}>B</span>
            </div>
            <span style={{fontSize: '18px', fontWeight: '700', color: '#3f3f3f'}}>Board</span>
          </div>
        </div>

        {/* 데스크탑 메뉴 */}
        <div className="desktop-menu" style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
          <span onClick={() => navigate('/')} style={{cursor: 'pointer', color: '#666', fontWeight: '500', fontSize: '15px'}}>홈</span>
          <span onClick={() => navigate('/posts/new')} style={{cursor: 'pointer', color: '#666', fontWeight: '500', fontSize: '15px'}}>글쓰기</span>
          <button onClick={() => navigate('/login')} style={{
            backgroundColor: '#5c6bc0', color: '#fff',
            padding: '8px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px'
          }}>
            로그인
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;