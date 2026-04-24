import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ADMIN_EMAIL = 'qkrwldnsdlek@gmail.com';

function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(new URLSearchParams(location.search).get('tab') || 'dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        alert('접근 권한이 없습니다.');
        navigate('/');
        return;
      }
      setUser(session.user);
      loadStats(session.user.email);
      loadPosts(session.user.email, 0);
    });
  }, []);

  const loadStats = async (email) => {
    const res = await api.get('/admin/stats', { headers: { 'X-User-Email': email } });
    setStats(res.data);
  };

  const loadPosts = async (email, p) => {
    const res = await api.get(`/admin/posts?page=${p}&size=10`, { headers: { 'X-User-Email': email } });
    setPosts(res.data.content);
    setTotalPages(res.data.totalPages);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await api.delete(`/admin/posts/${id}`, { headers: { 'X-User-Email': user.email } });
    loadPosts(user.email, page);
  };

  if (!user) return null;

  return (
    <div style={{maxWidth: '960px', margin: '50px auto', padding: '0 24px'}}>
      <h1 style={{fontSize: '24px', fontWeight: '700', color: '#3f3f3f', marginBottom: '24px'}}>
        🛠️ 관리자 페이지
      </h1>

      {/* 탭 메뉴 */}
      <div style={{display: 'flex', gap: '8px', marginBottom: '24px'}}>
        {['dashboard', 'posts'].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px', borderRadius: '10px', fontWeight: '600',
              backgroundColor: activeTab === tab ? '#5c6bc0' : '#f0f2ff',
              color: activeTab === tab ? '#fff' : '#5c6bc0',
              border: 'none', cursor: 'pointer'
            }}
          >
            {tab === 'dashboard' ? '📊 대시보드' : '📝 게시글 관리'}
          </button>
        ))}
      </div>

      {/* 대시보드 탭 */}
      {activeTab === 'dashboard' && stats && (
        <div>
          <div style={{display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'}}>
            <div style={{flex: 1, minWidth: '150px', backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center'}}>
              <p style={{fontSize: '13px', color: '#999', marginBottom: '8px'}}>전체 게시글</p>
              <p style={{fontSize: '32px', fontWeight: '700', color: '#5c6bc0'}}>{stats.totalPosts}</p>
            </div>
            <div style={{flex: 1, minWidth: '150px', backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'center'}}>
              <p style={{fontSize: '13px', color: '#999', marginBottom: '8px'}}>오늘 방문자</p>
              <p style={{fontSize: '32px', fontWeight: '700', color: '#5c6bc0'}}>{stats.todayVisit}</p>
            </div>
          </div>
          <div style={{backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)'}}>
            <h2 style={{fontSize: '16px', fontWeight: '700', color: '#3f3f3f', marginBottom: '20px'}}>📈 최근 7일 방문자</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.weeklyStats}>
                <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="count" fill="#5c6bc0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 게시글 관리 탭 */}
      {activeTab === 'posts' && (
        <div>
          <div style={{backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f0f2ff', color: '#5c6bc0'}}>
                  <th style={{padding: '14px', textAlign: 'center', width: '60px'}}>번호</th>
                  <th style={{padding: '14px', textAlign: 'left'}}>제목</th>
                  <th style={{padding: '14px', textAlign: 'center', width: '100px'}}>작성자</th>
                  <th style={{padding: '14px', textAlign: 'center', width: '120px'}}>카테고리</th>
                  <th style={{padding: '14px', textAlign: 'center', width: '100px'}}>작성일</th>
                  <th style={{padding: '14px', textAlign: 'center', width: '100px'}}>관리</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr key={post.id} style={{borderTop: '1px solid #f0f0f0'}}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td data-label="번호" style={{padding: '14px', textAlign: 'center', color: '#999'}}>{page * 10 + index + 1}</td>
                    <td data-label="제목" style={{padding: '14px'}}>
                      <span onClick={() => navigate(`/posts/${post.id}?from=admin&tab=posts`)}
                        style={{cursor: 'pointer', color: '#3d3d3d', fontWeight: '500'}}
                        onMouseEnter={e => e.target.style.color = '#5c6bc0'}
                        onMouseLeave={e => e.target.style.color = '#3d3d3d'}
                      >
                        {post.title}
                      </span>
                    </td>
                    <td data-label="작성자" style={{padding: '14px', textAlign: 'center', color: '#666'}}>{post.author}</td>
                    <td data-label="카테고리" style={{padding: '14px', textAlign: 'center'}}>
                      <span style={{
                        backgroundColor: '#f0f2ff', color: '#5c6bc0',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {post.category || '미분류'}
                      </span>
                    </td>
                    <td data-label="작성일" style={{padding: '14px', textAlign: 'center', color: '#999', fontSize: '13px'}}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="관리" style={{padding: '14px', textAlign: 'center'}}>
                      <button onClick={() => handleDelete(post.id)}
                        style={{backgroundColor: '#fce4ec', color: '#e57373', fontWeight: '600', fontSize: '13px'}}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이징 */}
          <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px'}}>
            <button onClick={() => { setPage(page-1); loadPosts(user.email, page-1); }}
              disabled={page === 0}
              style={{backgroundColor: page === 0 ? '#eee' : '#5c6bc0', color: page === 0 ? '#aaa' : '#fff', fontWeight: '600', padding: '8px 16px'}}>
              이전
            </button>
            {Array.from({length: totalPages}, (_, i) => (
              <button key={i} onClick={() => { setPage(i); loadPosts(user.email, i); }}
                style={{backgroundColor: page === i ? '#5c6bc0' : '#e8eaf6', color: page === i ? '#fff' : '#5c6bc0', fontWeight: '600', padding: '8px 14px'}}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => { setPage(page+1); loadPosts(user.email, page+1); }}
              disabled={page === totalPages - 1 || totalPages === 0}
              style={{backgroundColor: page === totalPages-1 || totalPages === 0 ? '#eee' : '#5c6bc0', color: page === totalPages-1 || totalPages === 0 ? '#aaa' : '#fff', fontWeight: '600', padding: '8px 16px'}}>
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;