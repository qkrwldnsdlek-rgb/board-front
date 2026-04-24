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
  const [noticePosts, setNoticePosts] = useState([]);h
  const [loading, setLoading] = useState(true);

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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #9fa8da 0%, #90caf9 100%)',
        borderRadius: 16,
        padding: '48px 40px',
        color: '#fff',
        marginBottom: 32,
        boxShadow: '0 4px 20px rgba(92,107,192,0.3)',
      }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>👋 환영합니다!</h1>
        <p style={{ margin: '12px 0 24px', fontSize: 16, opacity: 0.9 }}>
          자유롭게 소통하고 질문하는 커뮤니티입니다.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/posts')}
            style={{
              background: '#fff', color: '#5c6bc0',
              border: 'none', borderRadius: 8,
              padding: '10px 24px', fontWeight: 700,
              cursor: 'pointer', fontSize: 14,
            }}
          >
            게시글 보기
          </button>
          <button
            onClick={() => navigate('/posts/new')}
            style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: '2px solid rgba(255,255,255,0.6)', borderRadius: 8,
              padding: '10px 24px', fontWeight: 700,
              cursor: 'pointer', fontSize: 14,
            }}
          >
            글쓰기
          </button>
        </div>
      </div>

      {/* 카테고리 바로가기 */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 16 }}>카테고리</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.value}
              onClick={() => navigate(`/posts?category=${encodeURIComponent(cat.value)}`)}
              style={{
                flex: 1, minWidth: 140,
                background: cat.bg,
                borderRadius: 12,
                padding: '20px 24px',
                cursor: 'pointer',
                border: `2px solid transparent`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cat.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{cat.label.split(' ')[0]}</div>
              <div style={{ fontWeight: 700, color: cat.color, fontSize: 15 }}>
                {cat.label.split(' ').slice(1).join(' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

        {/* 최신 게시글 */}
        <div style={{ flex: 2, minWidth: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#333', margin: 0 }}>🕐 최신 게시글</h2>
            <span
              onClick={() => navigate('/posts')}
              style={{ fontSize: 13, color: '#5c6bc0', cursor: 'pointer', fontWeight: 600 }}
            >
              전체보기 →
            </span>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>불러오는 중...</div>
            ) : recentPosts.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>게시글이 없습니다.</div>
            ) : (
              recentPosts.map((post, i) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i < recentPosts.length - 1 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 4, marginRight: 8,
                        background: CATEGORIES.find(c => c.value === post.category)?.bg || '#f0f0f0',
                        color: CATEGORIES.find(c => c.value === post.category)?.color || '#666',
                      }}>
                        {post.category}
                      </span>
                      <span style={{
                        fontSize: 14, fontWeight: 500, color: '#222',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {post.title}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#aaa', marginLeft: 12, flexShrink: 0 }}>
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                    {post.author} · 👁 {post.viewCount ?? 0}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 공지사항 */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#333', margin: 0 }}>📢 공지사항</h2>
            <span
              onClick={() => navigate('/posts?category=%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD')}
              style={{ fontSize: 13, color: '#e53935', cursor: 'pointer', fontWeight: 600 }}
            >
              전체보기 →
            </span>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>불러오는 중...</div>
            ) : noticePosts.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>공지사항이 없습니다.</div>
            ) : (
              noticePosts.map((post, i) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i < noticePosts.length - 1 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff8f8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#222', marginBottom: 4 }}>
                    {post.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
