import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // 프로필 업데이트 이벤트 감지
    const handleProfileUpdate = () => {
      if (user) loadProfile(user.id);
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const Avatar = () => (
    <div onClick={() => navigate('/mypage')} className="desktop-menu" style={{cursor: 'pointer'}}>
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="프로필"
          style={{width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover'}}
        />
      ) : (
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          backgroundColor: '#5c6bc0', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px', color: '#fff', fontWeight: '700'
        }}>
          {profile ? profile.nickname[0].toUpperCase() : '?'}
        </div>
      )}
    </div>
  );

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
        {/* 왼쪽: 햄버거 + 로고 */}
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
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

        {/* 오른쪽 */}
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          {user ? (
            <>
              <Avatar />
              <button onClick={handleLogout} style={{
                backgroundColor: '#f5f5f5', color: '#666',
                padding: '8px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px'
              }}>
                로그아웃
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={{
              backgroundColor: '#5c6bc0', color: '#fff',
              padding: '8px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px'
            }}>
              로그인
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;