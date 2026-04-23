import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      backgroundColor: '#fff',
      borderRight: '1px solid #eee',
      padding: '24px 16px',
      position: 'fixed',
      top: '60px',
      left: 0,
    }}>

      {/* 메뉴 */}
      <div style={{marginBottom: '32px'}}>
        <p style={{fontSize: '11px', fontWeight: '700', color: '#bbb', letterSpacing: '1px', marginBottom: '12px'}}>MENU</p>
        <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
          <li onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
            color: '#444', fontWeight: '500', fontSize: '14px',
            marginBottom: '4px', transition: 'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🏠 홈
          </li>
          <li onClick={() => navigate('/posts/new')} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
            color: '#444', fontWeight: '500', fontSize: '14px',
            marginBottom: '4px'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ✏️ 글쓰기
          </li>
        </ul>
      </div>

      {/* 카테고리 */}
      <div style={{marginBottom: '32px'}}>
        <p style={{fontSize: '11px', fontWeight: '700', color: '#bbb', letterSpacing: '1px', marginBottom: '12px'}}>CATEGORY</p>
        <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
          {['전체', '공지사항', '자유게시판', '질문'].map((cat) => (
            <li key={cat} style={{
              padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
              color: '#444', fontWeight: '500', fontSize: '14px', marginBottom: '4px'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f2ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* 통계 */}
      <div style={{
        backgroundColor: '#f8f9ff', borderRadius: '12px', padding: '16px'
      }}>
        <p style={{fontSize: '11px', fontWeight: '700', color: '#bbb', letterSpacing: '1px', marginBottom: '12px'}}>STATS</p>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
          <span style={{fontSize: '13px', color: '#888'}}>전체 게시글</span>
          <span style={{fontSize: '13px', fontWeight: '700', color: '#5c6bc0'}}>-</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span style={{fontSize: '13px', color: '#888'}}>오늘 방문</span>
          <span style={{fontSize: '13px', fontWeight: '700', color: '#5c6bc0'}}>-</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;