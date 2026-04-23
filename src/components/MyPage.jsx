import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function MyPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else setUser(session.user);
    });
  }, []);

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까?\n탈퇴 후 모든 정보가 삭제됩니다.')) return;
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      alert('탈퇴 처리 중 오류가 발생했습니다.');
      return;
    }
    await supabase.auth.signOut();
    alert('회원탈퇴가 완료됐습니다.');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={{maxWidth: '500px', margin: '50px auto', padding: '0 24px'}}>
      <h1 style={{fontSize: '24px', fontWeight: '700', color: '#3f3f3f', marginBottom: '24px'}}>마이페이지</h1>

      {/* 프로필 카드 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '32px',
        marginBottom: '16px'
      }}>
        {/* 아바타 */}
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px'}}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#5c6bc0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '28px', color: '#fff', fontWeight: '700'
          }}>
            {user.email ? user.email[0].toUpperCase() : '?'}
          </div>
          <div>
            <p style={{fontSize: '18px', fontWeight: '700', color: '#3f3f3f', marginBottom: '4px'}}>
              {user.user_metadata?.name || '회원'}
            </p>
            <p style={{fontSize: '14px', color: '#999'}}>{user.email || '이메일 없음'}</p>
          </div>
        </div>

        {/* 가입일 */}
        <div style={{
          backgroundColor: '#f8f9ff', borderRadius: '12px', padding: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{fontSize: '14px', color: '#888'}}>가입일</span>
          <span style={{fontSize: '14px', fontWeight: '600', color: '#5c6bc0'}}>
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* 회원탈퇴 카드 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '32px'
      }}>
        <h2 style={{fontSize: '16px', fontWeight: '700', color: '#e57373', marginBottom: '8px'}}>
          회원탈퇴
        </h2>
        <p style={{fontSize: '14px', color: '#999', marginBottom: '20px'}}>
          탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
        <button
          onClick={handleDeleteAccount}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: '#fff', color: '#e57373',
            border: '1.5px solid #e57373', borderRadius: '12px',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#fce4ec';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#fff';
          }}
        >
          회원탈퇴
        </button>
      </div>
    </div>
  );
}

export default MyPage;