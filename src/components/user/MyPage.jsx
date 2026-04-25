import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

function MyPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ nickname: '', avatar_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) {
      setProfile(data);
      if (data.avatar_url) setPreview(data.avatar_url);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('프로필 사진을 삭제하시겠습니까?')) return;
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: '' })
      .eq('id', user.id);
    if (!error) {
      setProfile({ ...profile, avatar_url: '' });
      setPreview(null);
      setImageFile(null);
      window.dispatchEvent(new Event('profileUpdated'));
      alert('프로필 사진이 삭제됐습니다!');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let avatarUrl = profile.avatar_url;

    if (imageFile) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${imageFile.name.split('.').pop()}`;
      const { error } = await supabase.storage
        .from('board-images')
        .upload(`avatars/${fileName}`, imageFile, { upsert: true });
      if (error) {
        alert('이미지 업로드 실패: ' + error.message);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage
        .from('board-images')
        .getPublicUrl(`avatars/${fileName}`);
      avatarUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        nickname: profile.nickname,
        avatar_url: avatarUrl,
        updated_at: new Date()
      });

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      alert('프로필이 저장됐습니다!');
      setProfile({ ...profile, avatar_url: avatarUrl });
      window.dispatchEvent(new Event('profileUpdated'));
    }
    setSaving(false);
  };

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
        {/* 아바타 + 정보 */}
      <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px'}}>
        <label
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative', width: '100px', height: '100px',
            borderRadius: '50%', cursor: 'pointer', display: 'block', flexShrink: 0
          }}
        >
          {/* 이미지 또는 기본 아바타 */}
          {preview ? (
            <img src={preview} alt="프로필"
              style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover'}}
            />
          ) : (
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              backgroundColor: '#5c6bc0', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '40px', color: '#fff', fontWeight: '700'
            }}>
              {user.email ? user.email[0].toUpperCase() : '?'}
            </div>
          )}
          {hovered && (
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '100px', height: '100px', borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px'
            }}>
              📷
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}} />
        </label>

        {preview && (
          <button
            onClick={(e) => { e.preventDefault(); handleDeleteAvatar(); }}
            style={{
              marginTop: '8px', fontSize: '12px', color: '#e57373',
              backgroundColor: 'transparent', border: 'none',
              cursor: 'pointer', textDecoration: 'underline'
            }}
          >
            사진 삭제
          </button>
        )}

        <div>
          <p style={{fontSize: '18px', fontWeight: '700', color: '#3f3f3f', marginBottom: '4px'}}>
            {profile.nickname || '닉네임 없음'}
          </p>
          <p style={{fontSize: '14px', color: '#999'}}>{user.email || '이메일 없음'}</p>
        </div>
      </div>

        {/* 닉네임 입력 */}
        <div style={{marginBottom: '16px'}}>
          <label style={{fontSize: '14px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px'}}>닉네임</label>
          <input
            value={profile.nickname || ''}
            onChange={e => setProfile({ ...profile, nickname: e.target.value })}
            placeholder="닉네임을 입력하세요"
            style={{width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', boxSizing: 'border-box'}}
          />
        </div>

        {/* 가입일 */}
        <div style={{
          backgroundColor: '#f8f9ff', borderRadius: '12px', padding: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px'
        }}>
          <span style={{fontSize: '14px', color: '#888'}}>가입일</span>
          <span style={{fontSize: '14px', fontWeight: '600', color: '#5c6bc0'}}>
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: '#5c6bc0', color: '#fff',
            border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer'
          }}
        >
          {saving ? '저장 중...' : '프로필 저장'}
        </button>
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
          onMouseEnter={e => e.target.style.backgroundColor = '#fce4ec'}
          onMouseLeave={e => e.target.style.backgroundColor = '#fff'}
        >
          회원탈퇴
        </button>
      </div>
    </div>
  );
}

export default MyPage;