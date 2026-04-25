import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api';
import { supabase } from '../../supabase';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const category = new URLSearchParams(location.search).get('category') || '';
  const fromAdmin = new URLSearchParams(location.search).get('from') === 'admin';
  const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';
  const tab = new URLSearchParams(location.search).get('tab') || 'dashboard';

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    api.get(`/posts/${id}`).then(res => setPost(res.data));
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('삭제하시겠습니까?')) {
      api.delete(`/posts/${id}`).then(() => goBack());
    }
  };

  if (!post) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#aaa' }}>로딩중...</div>
  );

  return (
    <div style={{maxWidth: '1100px', margin: '50px auto', padding: '0 24px'}}>
      <div style={{backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '40px'}}>
        <h1 style={{fontSize: '26px', fontWeight: '700', color: '#3f3f3f', marginBottom: '16px'}}>
          {post.title}
        </h1>
        <div style={{display: 'flex', gap: '16px', color: '#999', fontSize: '14px', marginBottom: '32px'}}>
          <span>👤 {post.author}</span>
          <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
          <span>👀 {post.viewCount}</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', marginBottom: '32px' }} />
        <p style={{fontSize: '16px', lineHeight: '1.9', color: '#444', whiteSpace: 'pre-wrap', minHeight: '200px'}}>
          {post.content}
        </p>

        {post.imageUrl && (
          <>
            <div style={{marginBottom: '32px'}}>
              <img src={post.imageUrl} alt="첨부 이미지" onClick={() => setShowModal(true)}
                style={{maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px', cursor: 'zoom-in', boxShadow: '0 2px 12px rgba(0,0,0,0.1)'}}
              />
            </div>
            {showModal && (
              <div onClick={() => setShowModal(false)}
                style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'}}>
                <img src={post.imageUrl} alt="첨부 이미지" style={{maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px'}} />
                <div style={{position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '36px', cursor: 'pointer', fontWeight: '300'}}>✕</div>
              </div>
            )}
          </>
        )}

        {post.youtubeUrl && getYoutubeEmbedUrl(post.youtubeUrl) && (
          <div style={{marginBottom: '32px'}}>
            <iframe
              key={post.youtubeUrl}
              width="100%"
              height="450"
              src={getYoutubeEmbedUrl(post.youtubeUrl)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{borderRadius: '12px'}}
            />
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '32px 0' }} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={goBack} style={{ backgroundColor: '#f5f5f5', color: '#888', fontWeight: '600' }}>
            목록
          </button>
          {user && user.id === post.userId && (
            <>
              <button onClick={() => navigate(`/posts/${id}/edit${fromAdmin ? '?from=admin&tab=posts' : categoryParam}`)}
                style={{ backgroundColor: '#e8eaf6', color: '#5c6bc0', fontWeight: '600' }}>
                수정
              </button>
              <button onClick={handleDelete} style={{ backgroundColor: '#fce4ec', color: '#e57373', fontWeight: '600' }}>
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;