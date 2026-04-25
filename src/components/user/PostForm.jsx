import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api';
import { supabase } from '../../supabase';

function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const location = useLocation();
  const category = new URLSearchParams(location.search).get('category') || '';
  const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
    imageUrl: '',
    category: '자유게시판',
    youtubeUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fromAdmin = new URLSearchParams(location.search).get('from') === 'admin';
  const tab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const goBack = () => {
    if (fromAdmin) navigate(`/admin?tab=${tab}`);
    else navigate(`/posts${categoryParam}`);
  };

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', u.id)
          .single();
        setProfile(data);
        if (!isEdit && data?.nickname) {
          setForm(prev => ({ ...prev, author: data.nickname }));
        }
      }
    });
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/posts/${id}`).then(res => {
        setForm(res.data);
        if (res.data.imageUrl) setPreview(res.data.imageUrl);
      });
    }
  }, [id]);

  useEffect(() => {
    if (!isEdit && category) {
      setForm(prev => ({ ...prev, category }));
    }
  }, [category]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return form.imageUrl;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('로그인이 필요합니다.');
      return null;
    }
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${imageFile.name.split('.').pop()}`;
    const { error } = await supabase.storage
      .from('board-images')
      .upload(fileName, imageFile, { upsert: true });
    if (error) {
      alert('이미지 업로드 실패: ' + error.message);
      return null;
    }
    const { data } = supabase.storage
      .from('board-images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.author) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    setUploading(true);
    const imageUrl = await uploadImage();
    const postData = { ...form, imageUrl, userId: user?.id };
    if (isEdit) {
      api.put(`/posts/${id}`, postData).then(() => navigate(`/posts/${id}${fromAdmin ? '?from=admin&tab=posts' : categoryParam}`));
    } else {
      api.post('/posts', postData).then(() => navigate(`/posts${categoryParam}`));
    }
    setUploading(false);
  };

  return (
    <div style={{maxWidth: '1100px', margin: '50px auto', padding: '0 24px'}}>
      <div style={{backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '40px'}}>
        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#3f3f3f', marginBottom: '32px'}}>
          {isEdit ? '✏️ 게시글 수정' : '📝 게시글 작성'}
        </h1>

        <div style={{marginBottom: '20px'}}>
          <label style={{fontSize: '14px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px'}}>제목</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="제목을 입력하세요" />
        </div>

        <div style={{marginBottom: '20px'}}>
          <label style={{fontSize: '14px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px'}}>작성자</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="작성자를 입력하세요"
            disabled={!!profile?.nickname || isEdit}
            style={{ opacity: (profile?.nickname || isEdit) ? 0.6 : 1, cursor: (profile?.nickname || isEdit) ? 'not-allowed' : 'text' }}
          />
        </div>

        {(!category || user?.email === ADMIN_EMAIL) && (
          <div style={{marginBottom: '20px'}}>
            <label style={{fontSize: '14px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px'}}>카테고리</label>
            <select name="category" value={form.category} onChange={handleChange}
              style={{width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', backgroundColor: '#fff', cursor: 'pointer'}}
            >
              <option value="공지사항">공지사항</option>
              <option value="자유게시판">자유게시판</option>
              <option value="질문">질문</option>
            </select>
          </div>
        )}

        <div style={{marginBottom: '32px'}}>
          <label style={{fontSize: '14px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px'}}>내용</label>
          <textarea name="content" value={form.content} onChange={handleChange} placeholder="내용을 입력하세요" rows={10} style={{resize: 'vertical'}} />
        </div>

        <div style={{marginBottom: '20px'}}>
          <label style={{fontSize: '14px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px'}}>이미지 첨부</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <img src={preview} alt="미리보기" style={{marginTop: '10px', maxWidth: '100%', maxHeight: '200px', borderRadius: '10px', objectFit: 'cover'}} />
          )}
        </div>

        <div style={{marginBottom: '20px'}}>
          <label style={{fontSize: '14px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px'}}>YouTube URL (선택)</label>
          <input
            name="youtubeUrl"
            value={form.youtubeUrl || ''}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
          <button onClick={goBack} style={{backgroundColor: '#f5f5f5', color: '#888', fontWeight: '600'}}>취소</button>
          <button onClick={handleSubmit} disabled={uploading}
            style={{backgroundColor: '#5c6bc0', color: '#fff', fontWeight: '600', padding: '10px 24px'}}>
            {uploading ? '업로드 중...' : isEdit ? '수정 완료' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostForm;