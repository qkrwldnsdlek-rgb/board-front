import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabase';

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    let channel = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        loadNotifications(session.user.id);
        if (!channel) channel = subscribeNotifications(session.user.id);
      } else {
        setProfile(null);
        setNotifications([]);
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) loadProfile(user.id);
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  // 알림 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const loadNotifications = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20); // 최근20개
    if (data) setNotifications(data);
  };

  const subscribeNotifications = (userId) => {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe((status) => {
        console.log('구독 상태:', status);
      });
    return channel;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotifClick = async () => {
    const nextShow = !showNotif;
    setShowNotif(nextShow);
    
    if (nextShow && unreadCount > 0) {  // ← showNotif 대신 nextShow 사용
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
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
              {/* 알림 벨 */}
              <div ref={notifRef} style={{position: 'relative'}}>
                <button onClick={handleNotifClick} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '22px', position: 'relative', padding: '4px'
                }}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '0px', right: '0px',
                      backgroundColor: '#e57373', color: '#fff',
                      borderRadius: '50%', width: '18px', height: '18px',
                      fontSize: '11px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {/* 알림 드롭다운 */}
                {showNotif && (
                    <div style={{
                      position: isMobile ? 'fixed' : 'absolute',
                      right: isMobile ? '8px' : '-20px',
                      top: isMobile ? '60px' : '44px',
                      width: isMobile ? 'calc(100vw - 16px)' : '320px',
                      maxWidth: '320px',
                      zIndex: 9999,
                    }}>
                    {/* 꼭지점 삼각형 - 모바일에서는 숨김 */}
                    {!isMobile && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '31px',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid #fff',
                        filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.08))',
                        zIndex: 10000,
                      }} />
                    )}

                    {/* 실제 내용 - 여기만 scroll */}
                    <div style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}>
                      <div style={{padding: '16px', borderBottom: '1px solid #f0f0f0', fontWeight: '700', fontSize: '15px'}}>
                        알림
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{padding: '24px', textAlign: 'center', color: '#aaa', fontSize: '14px'}}>
                          읽지않은 알림이 없습니다.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id}
                            onClick={async () => {
                              await supabase.from('notifications').delete().eq('id', n.id);
                              setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                              navigate(`/posts/${n.post_id}#comment-${n.comment_id}`);
                              setShowNotif(false);
                            }}
                            style={{
                              padding: '14px 16px', cursor: 'pointer',
                              backgroundColor: n.is_read ? '#fff' : '#f8f9ff',
                              borderBottom: '1px solid #f0f0f0',
                            }}>
                            <div style={{fontSize: '13px', color: '#444', fontWeight: n.is_read ? '400' : '600'}}>
                              {n.message}
                            </div>
                            <div style={{fontSize: '11px', color: '#aaa', marginTop: '4px'}}>
                              {n.post_title} · {formatTimeAgo(n.created_at)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
