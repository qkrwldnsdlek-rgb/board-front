import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api';
import { supabase } from '../../supabase';
import 'react-quill-new/dist/quill.snow.css';
import CommentSection from './CommentSection';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  const category = new URLSearchParams(location.search).get('category') || '';
  const fromAdmin = new URLSearchParams(location.search).get('from') === 'admin';
  const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';
  const tab = new URLSearchParams(location.search).get('tab') || 'dashboard';
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  const goBack = () => {
    if (fromAdmin) navigate(`/admin?tab=${tab}`);
    else navigate(`/posts${categoryParam}`);
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase.from('profiles').select('nickname, avatar_url').eq('id', u.id).single();
        setProfile(data);
      }
    });
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    api.get(`/posts/${id}`).then(res => setPost(res.data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const contentImages = [...doc.querySelectorAll('img')]
      .map(img => img.src)
      .filter(src => src.includes('board-images'));
    const allImageUrls = [...contentImages];
    if (post.imageUrl) allImageUrls.push(post.imageUrl);
    if (allImageUrls.length > 0) {
      const filePaths = allImageUrls.map(url =>
        url.split('/storage/v1/object/public/board-images/')[1]
      ).filter(Boolean);
      if (filePaths.length > 0) {
        const { error } = await supabase.storage.from('board-images').remove(filePaths);
        if (error) console.error('이미지 삭제 실패:', error);
      }
    }
    await api.delete(`/posts/${id}`);
    goBack();
  };

  if (!post) return <div style={{ textAlign: 'center', marginTop: '100px', color: '#aaa' }}>로딩중...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '50px auto', padding: isMobile ? '0 12px' : '0 24px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: isMobile ? '20px 16px' : '40px' }}>
        <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: '#3f3f3f', marginBottom: '16px' }}>{post.title}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#999', fontSize: '13px', marginBottom: '32px' }}>
          <span>👤 {post.author}</span>
          <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
          <span>👀 {post.viewCount}</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', marginBottom: '32px' }} />
        <div
          className="ql-editor"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ padding: 0, fontSize: '16px', lineHeight: '1.9', minHeight: '200px', wordBreak: 'break-word' }}
        />

        {post.youtubeUrl && getYoutubeEmbedUrl(post.youtubeUrl) && (
          <div style={{ marginBottom: '32px' }}>
            <iframe key={post.youtubeUrl} width="100%" height={isMobile ? '220' : '450'}
              src={getYoutubeEmbedUrl(post.youtubeUrl)} frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen style={{ borderRadius: '12px' }} />
          </div>
        )}

        {post.imageUrl && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '32px 0' }} />
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#888', marginBottom: '12px' }}>📎 대표 이미지</p>
              <img src={post.imageUrl} alt="첨부 이미지" onClick={() => setShowModal(true)}
                style={{ maxWidth: '40%', maxHeight: '200px', objectFit: 'contain', cursor: 'zoom-in', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }} />
            </div>
            {showModal && (
              <div onClick={() => setShowModal(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
                <img src={post.imageUrl} alt="첨부 이미지" style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} />
                <div style={{ position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '36px', cursor: 'pointer', fontWeight: '300' }}>✕</div>
              </div>
            )}
          </>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '32px 0' }} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={goBack} style={{ backgroundColor: '#f5f5f5', color: '#888', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>목록</button>
          {user && (user.id === post.userId || user.email === ADMIN_EMAIL) && (
            <>
              <button onClick={() => navigate(`/posts/${id}/edit${fromAdmin ? '?from=admin&tab=posts' : categoryParam}`)}
                style={{ backgroundColor: '#e8eaf6', color: '#5c6bc0', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>수정</button>
              <button onClick={handleDelete}
                style={{ backgroundColor: '#fce4ec', color: '#e57373', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>삭제</button>
            </>
          )}
        </div>
      </div>

      {/* ✅ 댓글 섹션 분리 */}
      <CommentSection postId={id} user={user} profile={profile} isMobile={isMobile} />
    </div>
  );
}

export default PostDetail;