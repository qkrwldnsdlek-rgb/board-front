import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function PostList() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/posts').then(res => setPosts(res.data));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      api.delete(`/posts/${id}`).then(() => {
        setPosts(posts.filter(post => post.id !== id));
      });
    }
  };

  return (
    <div style={{maxWidth: '860px', margin: '50px auto', padding: '0 24px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 style={{fontSize: '26px', fontWeight: '700', color: '#3f3f3f'}}>게시판</h1>
        <button onClick={() => navigate('/posts/new')} style={{backgroundColor: '#5c6bc0', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: '600'}}>
          + 글쓰기
        </button>
      </div>
      <div style={{backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{backgroundColor: '#f0f2ff', color: '#5c6bc0'}}>
              <th style={{padding: '14px', textAlign: 'center', width: '60px'}}>번호</th>
              <th style={{padding: '14px', textAlign: 'left'}}>제목</th>
              <th style={{padding: '14px', textAlign: 'center', width: '100px'}}>작성자</th>
              <th style={{padding: '14px', textAlign: 'center', width: '120px'}}>작성일</th>
              <th style={{padding: '14px', textAlign: 'center', width: '120px'}}>관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{textAlign: 'center', padding: '40px', color: '#aaa'}}>
                  게시글이 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post, index) => (
                <tr key={post.id} style={{borderTop: '1px solid #f0f0f0'}}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{padding: '14px', textAlign: 'center', color: '#999'}}>{index + 1}</td>
                  <td style={{padding: '14px'}}>
                    <span onClick={() => navigate(`/posts/${post.id}`)}
                      style={{cursor: 'pointer', color: '#3d3d3d', fontWeight: '500'}}
                      onMouseEnter={e => e.target.style.color = '#5c6bc0'}
                      onMouseLeave={e => e.target.style.color = '#3d3d3d'}
                    >
                      {post.title}
                    </span>
                  </td>
                  <td style={{padding: '14px', textAlign: 'center', color: '#666'}}>{post.author}</td>
                  <td style={{padding: '14px', textAlign: 'center', color: '#999', fontSize: '13px'}}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{padding: '14px', textAlign: 'center'}}>
                    <button onClick={() => navigate(`/posts/${post.id}/edit`)} style={{backgroundColor: '#e8eaf6', color: '#5c6bc0', marginRight: '6px', fontWeight: '600'}}>수정</button>
                    <button onClick={() => handleDelete(post.id)} style={{backgroundColor: '#fce4ec', color: '#e57373', fontWeight: '600'}}>삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PostList;