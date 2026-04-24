import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CATEGORIES = [
  { label: '📢 공지사항', value: '공지사항', color: '#e53935', bg: '#ffebee' },
  { label: '💬 자유게시판', value: '자유게시판', color: '#1e88e5', bg: '#e3f2fd' },
  { label: '❓ 질문', value: '질문', color: '#43a047', bg: '#e8f5e9' },
];

function Home() {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState([]);
  const [noticePosts, setNoticePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [recentRes, noticeRes] = await Promise.all([
          api.get('/posts?page=0&size=5&sort=createdAt,desc'),
          api.get('/posts?page=0&size=3&category=공지사항&sort=createdAt,desc'),
        ]);
        setRecentPosts(recentRes.data.content || []);
        setNoticePosts(noticeRes.data.content || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>

      <div style={{
        background: 'linear-gradient(135deg, #9fa8da 0%, #90caf9 100%)',
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? '28px 20px' : '48px 40px',
        color: '#fff',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(92,107,192,0.3)',
      }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 32, fontWeight: 700 }}>👋 환영합니다!</h1>
        <p style={{ margin: '10px 0 18px', fontSize: isMobile ? 13 : 16, opacity: 0.9 }}>
          자유롭게 소통하고 질문하는 커뮤니티입니다.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 12 }}>카테고리</h2>
        <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.value}
              onClick={() => navigate(`/posts?category=${encodeURIComponent(cat.value)}`)}
              style={{
                flex: 1,
                background: cat.bg,
                borderRadius: 10,
                padding: isMobile ? '12px 16px' : '18px 20px',
                cursor: 'pointer',
                border: '2px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cat.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ fontSize: 18 }}>{cat.label.split(' ')[0]}</div>
              <div style={{ fontWeight: 700, color: cat.color, fontSize: 14 }}>
                {cat.label.split(' ').slice(1).join(' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexDirection: isMobile ? 'column' : 'row' }}>

        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#333', margin: 0 }}>🕐 최신 게시글</h2>
            <span onClick={() => navigate('/posts')} style={{ fontSize: 12, color: '#5c6bc0', cursor: 'pointer', fontWeight: 600 }}>전체보기 →</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>불러오는 중...</div>
            ) : recentPosts.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>게시글이 없습니다.</div>
            ) : recentPosts.map((post, i) => (
              <div
                key={post.id}
                onClick={() => navigate(`/posts/${post.id}`)}
                style={{ padding: '12px 16px', borderBottom: i < recentPosts.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, marginRight: 6, background: CATEGORIES.find(c => c.value === post.category)?.bg || '#f0f0f0', color: CATEGORIES.find(c => c.value === post.category)?.color || '#666' }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>{post.title}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8, flexShrink: 0 }}>{formatDate(post.createdAt)}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>{post.author} · 👁 {post.viewCount ?? 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#333', margin: 0 }}>📢 공지사항</h2>
            <span onClick={() => navigate('/posts?category=%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD')} style={{ fontSize: 12, color: '#e53935', cursor: 'pointer', fontWeight: 600 }}>전체보기 →</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>불러오는 중...</div>
            ) : noticePosts.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>공지사항이 없습니다.</div>
            ) : noticePosts.map((post, i) => (
              <div
                key={post.id}
                onClick={() => navigate(`/posts/${post.id}`)}
                style={{ padding: '12px 16px', borderBottom: i < noticePosts.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff8f8'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 4 }}>{post.title}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{formatDate(post.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;