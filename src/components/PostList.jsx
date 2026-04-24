import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { supabase } from '../supabase';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const category = new URLSearchParams(location.search).get('category') || '';

  useEffect(() => {
    setPage(0);
  }, [category]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let url = `/posts?page=${page}&size=10`;
    if (keyword) url += `&keyword=${keyword}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    api.get(url).then(res => {
      setPosts(res.data.content);
      setTotalPages(res.data.totalPages);
    });
  }, [page, keyword, category]);

  const handleSearch = () => {
    setPage(0);
    setKeyword(searchInput);
  };

  const handleDelete = (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      let url = `/posts?page=${page}&size=10`;
      if (keyword) url += `&keyword=${keyword}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      api.delete(`/posts/${id}`).then(() => {
        api.get(url).then(res => {
          setPosts(res.data.content);
          setTotalPages(res.data.totalPages);
        });
      });
    }
  };

  return (
    <div style={{maxWidth: '860px', margin: '50px auto', padding: '0 24px'}}>
      <div style={{marginBottom: '24px'}}>
        <h1 style={{fontSize: '26px', fontWeight: '700', color: '#3f3f3f'}}>
          {category || '전체'} 게시판
        </h1>
      </div>

      {/* 검색창 */}
      <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="제목으로 검색..."
          style={{flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px'}}
        />
        <button onClick={handleSearch} style={{backgroundColor: '#5c6bc0', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: '600'}}>
          검색
        </button>
        {keyword && (
          <button
            onClick={() => { setKeyword(''); setSearchInput(''); setPage(0); }}
            style={{backgroundColor: '#f5f5f5', color: '#888', padding: '10px 16px', borderRadius: '10px', fontWeight: '600'}}
          >
            초기화
          </button>
        )}
      </div>

      <div style={{backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{backgroundColor: '#f0f2ff', color: '#5c6bc0'}}>
              <th style={{padding: '14px', textAlign: 'center', width: '60px'}}>번호</th>
              <th style={{padding: '14px', textAlign: 'left'}}>제목</th>
              <th style={{padding: '14px', textAlign: 'center', width: '80px'}}>이미지</th>
              <th style={{padding: '14px', textAlign: 'center', width: '100px'}}>작성자</th>
              <th style={{padding: '14px', textAlign: 'center', width: '120px'}}>작성일</th>
              <th style={{padding: '14px', textAlign: 'center', width: '80px'}}>조회수</th>
              {user && <th style={{padding: '14px', textAlign: 'center', width: '120px'}}>관리</th>}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={user ? 7 : 6} style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>
                  {keyword ? `"${keyword}" 검색 결과가 없습니다.` : '게시글이 없습니다.'}
                </td>
              </tr>
            ) : (
              posts.map((post, index) => (
                <tr key={post.id} style={{borderTop: '1px solid #f0f0f0'}}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td data-label="번호" style={{padding: '14px', textAlign: 'center', color: '#999'}}>{page * 10 + index + 1}</td>
                  <td data-label="제목" style={{padding: '14px', fontWeight: 'bold'}}>
                    <span onClick={() => navigate(`/posts/${post.id}`)}
                      style={{cursor: 'pointer', color: '#3d3d3d', fontWeight: '500'}}
                      onMouseEnter={e => e.target.style.color = '#5c6bc0'}
                      onMouseLeave={e => e.target.style.color = '#3d3d3d'}
                    >
                      {post.title}
                    </span>
                  </td>
                  <td data-label="이미지" style={{padding: '14px', textAlign: 'center'}}>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="썸네일"
                        style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px'}}
                      />
                    )}
                  </td>
                  <td data-label="작성자" style={{padding: '14px', textAlign: 'center', color: '#666'}}>{post.author}</td>
                  <td data-label="작성일" style={{padding: '14px', textAlign: 'center', color: '#999', fontSize: '13px'}}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label="조회수" style={{padding: '14px', textAlign: 'center', color: '#999', fontSize: '13px'}}>
                    {post.viewCount}
                  </td>
                  {user && (
                    <td data-label="관리" style={{padding: '14px', textAlign: 'center', whiteSpace: 'nowrap'}}>
                      {user.id === post.userId && (
                        <>
                          <button onClick={() => navigate(`/posts/${post.id}/edit`)} style={{backgroundColor: '#e8eaf6', color: '#5c6bc0', marginRight: '6px', fontWeight: '600'}}>수정</button>
                          <button onClick={() => handleDelete(post.id)} style={{backgroundColor: '#fce4ec', color: '#e57373', fontWeight: '600'}}>삭제</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이징 버튼 */}
      <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px'}}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          style={{backgroundColor: page === 0 ? '#eee' : '#5c6bc0', color: page === 0 ? '#aaa' : '#fff', fontWeight: '600', padding: '8px 16px'}}
        >
          이전
        </button>
        {Array.from({length: totalPages}, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            style={{backgroundColor: page === i ? '#5c6bc0' : '#e8eaf6', color: page === i ? '#fff' : '#5c6bc0', fontWeight: '600', padding: '8px 14px'}}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages - 1 || totalPages === 0}
          style={{backgroundColor: page === totalPages - 1 || totalPages === 0 ? '#eee' : '#5c6bc0', color: page === totalPages - 1 || totalPages === 0 ? '#aaa' : '#fff', fontWeight: '600', padding: '8px 16px'}}
        >
          다음
        </button>
      </div>

      {/* 글쓰기 버튼 */}
      {user && (
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
          <button onClick={() => navigate('/posts/new')} style={{backgroundColor: '#5c6bc0', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: '600'}}>
            + 글쓰기
          </button>
        </div>
      )}
    </div>
  );
}

export default PostList;