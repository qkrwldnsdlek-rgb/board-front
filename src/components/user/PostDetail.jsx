import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api';
import { supabase } from '../../supabase';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState('');

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

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

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
    return date.toLocaleDateString('ko-KR');
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
    loadComments();
  }, [id]);

  const loadComments = () => {
    api.get(`/comments/post/${id}`).then(res => setComments(res.data));
  };

  const handleDelete = () => {
    if (window.confirm('삭제하시겠습니까?')) {
      api.delete(`/posts/${id}`).then(() => goBack());
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    if (!user) { alert('로그인이 필요합니다.'); return; }
    await api.post('/comments', {
      postId: parseInt(id), content: commentInput,
      author: profile?.nickname || user.email, userId: user.id, parentId: null,
    });
    setCommentInput('');
    loadComments();
  };

  const handleReplySubmit = async (rootCommentId) => {
    if (!replyInputText.trim()) return;
    if (!user) { alert('로그인이 필요합니다.'); return; }
    await api.post('/comments', {
      postId: parseInt(id), content: replyInputText,
      author: profile?.nickname || user.email, userId: user.id, parentId: replyTargetId,
    });
    setActiveReplyId(null);
    setReplyInputText('');
    setReplyTargetId(null);
    setShowReplies({ ...showReplies, [rootCommentId]: true });
    loadComments();
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await api.delete(`/comments/${commentId}`);
    loadComments();
  };

  const handleCommentEdit = async (commentId) => {
    await api.put(`/comments/${commentId}`, { content: editInput });
    setEditingId(null);
    loadComments();
  };

  const handleLike = async (commentId) => {
    if (!user) { alert('로그인이 필요합니다.'); return; }
    await api.post(`/comments/${commentId}/like?userId=${user.id}`);
    loadComments();
  };

  const getAvatar = (author) => (
    <div className="desktop-menu">
    {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="프로필"
          style={{width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover'}}
        />
      ) : (
      <div style={{
        width: 36, height: 36, borderRadius: '50%', backgroundColor: '#5c6bc0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, color: '#fff', fontWeight: 700, flexShrink: 0
      }}>
        {author?.[0]?.toUpperCase() || '?'}
      </div>
      )}
    </div>
  );

  const ReplyInput = ({ rootCommentId }) => (
    <div style={{display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'flex-start'}}>
      {getAvatar(profile?.nickname || user?.email)}
      <div style={{flex: 1}}>
        <input value={replyInputText}
          onChange={e => setReplyInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReplySubmit(rootCommentId)}
          placeholder="답글 추가..."
          style={{width: '100%', padding: '8px 0', border: 'none', borderBottom: '2px solid #e0e0e0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: 'transparent'}}
          autoFocus
        />
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px'}}>
          <button onClick={() => { setActiveReplyId(null); setReplyInputText(''); setReplyTargetId(null); }}
            style={{backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 12px', borderRadius: '20px'}}>취소</button>
          <button onClick={() => handleReplySubmit(rootCommentId)}
            style={{backgroundColor: replyInputText.trim() ? '#5c6bc0' : '#e0e0e0', color: replyInputText.trim() ? '#fff' : '#999', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 16px', borderRadius: '20px'}}>답글</button>
        </div>
      </div>
    </div>
  );

  const parentComments = comments.filter(c => !c.parentId);
  const getDirectReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  const getAllDescendants = (commentId) => {
    const result = [];
    const collect = (pid) => {
      const children = comments.filter(c => c.parentId === pid);
      children.forEach(child => { result.push(child); collect(child.id); });
    };
    collect(commentId);
    return result;
  };

  const getAllRepliesCount = (commentId) => getAllDescendants(commentId).length;

  // 액션 버튼 (좋아요, 답글, 수정, 삭제)
  const ActionButtons = ({ item, rootCommentId, isRoot = false }) => (
    <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
      <button onClick={() => handleLike(item.id)}
        style={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', borderRadius: '20px'}}>
        👍 {item.likeCount > 0 && <span style={{fontSize: '12px'}}>{item.likeCount}</span>}
      </button>
      <button style={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', padding: '6px 8px', borderRadius: '20px'}}>👎</button>
      {user && (
        <button onClick={() => {
          setActiveReplyId(item.id);
          setReplyInputText(isRoot ? '' : `@${item.author} `);
          setReplyTargetId(item.id);
        }}
          style={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#3f3f3f', padding: '6px 12px', borderRadius: '20px'}}>
          답글
        </button>
      )}
      {user && (user.id === item.userId || user.email === ADMIN_EMAIL) && (
        <>
          <button onClick={() => { setEditingId(item.id); setEditInput(item.content); }}
            style={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#888', padding: '6px 8px', borderRadius: '20px'}}>수정</button>
          <button onClick={() => handleCommentDelete(item.id)}
            style={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#e57373', padding: '6px 8px', borderRadius: '20px'}}>삭제</button>
        </>
      )}
    </div>
  );

  // 재귀 렌더링 - 각 노드마다 아바타 아래 세로선
  const renderNode = (item, rootCommentId, isRoot = false) => {
  const children = getDirectReplies(item.id);
  const hasChildren = children.length > 0;
  const showChildren = isRoot ? showReplies[item.id] : true;

  return (
    <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
      {/* 1. 왼쪽: 아바타만 렌더링 (아래 세로선 로직 삭제) */}
      <div style={{ flexShrink: 0, width: '36px', zIndex: 1 }}>
        {getAvatar(item.author)}
      </div>

      {/* 2. 오른쪽: 내용 + 자식들 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: '700', fontSize: '13px', color: '#3f3f3f' }}>@{item.author}</span>
          <span style={{ fontSize: '12px', color: '#aaa' }}>{formatTimeAgo(item.createdAt)}</span>
        </div>
        
        {editingId === item.id ? (
          <div style={{ marginBottom: '8px' }}>
            <input value={editInput} onChange={e => setEditInput(e.target.value)}
              style={{ width: '100%', padding: '6px 0', border: 'none', borderBottom: '2px solid #5c6bc0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            />
            <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                      <button onClick={() => setEditingId(null)}
                        style={{backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '6px 12px', borderRadius: '20px'}}>취소</button>
                      <button onClick={() => handleCommentEdit(item.id)}
                        style={{backgroundColor: '#5c6bc0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '6px 16px', borderRadius: '20px'}}>저장</button>
                    </div>
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#444', margin: '0 0 8px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {item.content}
          </p>
        )}

        <ActionButtons item={item} rootCommentId={rootCommentId} isRoot={isRoot} />
        {activeReplyId === item.id && <ReplyInput rootCommentId={rootCommentId} />}

        {/* 3. 자식 대댓글 렌더링 섹션 */}
        {hasChildren && showChildren && (
          <div style={{ marginTop: '12px', paddingLeft: '0px' }}>
            {children.map((child, index) => (
              <div key={child.id} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: isMobile ? '-20px' : '-32px',
                  top: '-50px',
                  width: isMobile ? '15px' : '25px',
                  height: '82px',
                  borderLeft: '1.5px solid #ebebeb',
                  borderBottom: '1.5px solid #ebebeb',
                  borderBottomLeftRadius: '22px',
                }} />
                {index !== children.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: isMobile ? '-20px' : '-32px',
                    top: '7px',
                    bottom: '-12px',
                    borderLeft: '1.5px solid #ebebeb',
                  }} />
                )}
                <div style={{ paddingTop: '12px' }}>
                  {renderNode(child, rootCommentId, false)}
                </div>
              </div>
            ))}
          </div>
        )}

        {isRoot && hasChildren && (
          <button onClick={() => setShowReplies({ ...showReplies, [item.id]: !showReplies[item.id] })}
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#5c6bc0', fontWeight: '700', fontSize: '14px', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {showReplies[item.id] ? `▲ 답글 숨기기` : `▼ 답글 ${getAllRepliesCount(item.id)}개`}
          </button>
        )}
      </div>
    </div>
  );
};

  if (!post) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#aaa' }}>로딩중...</div>
  );

  return (
    <div style={{maxWidth: '1100px', margin: '50px auto', padding: '0 24px'}}>
      <div style={{backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '40px'}}>
        <h1 style={{fontSize: '26px', fontWeight: '700', color: '#3f3f3f', marginBottom: '16px'}}>{post.title}</h1>
        <div style={{display: 'flex', gap: '16px', color: '#999', fontSize: '14px', marginBottom: '32px'}}>
          <span>👤 {post.author}</span>
          <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
          <span>👀 {post.viewCount}</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', marginBottom: '32px' }} />
        <p style={{fontSize: '16px', lineHeight: '1.9', color: '#444', whiteSpace: 'pre-wrap', minHeight: '200px'}}>{post.content}</p>

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
            <iframe key={post.youtubeUrl} width="100%" height="450"
              src={getYoutubeEmbedUrl(post.youtubeUrl)} frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen style={{borderRadius: '12px'}}
            />
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '32px 0' }} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={goBack} style={{ backgroundColor: '#f5f5f5', color: '#888', fontWeight: '600' }}>목록</button>
          {user && (user.id === post.userId || user.email === ADMIN_EMAIL) && (
            <>
              <button onClick={() => navigate(`/posts/${id}/edit${fromAdmin ? '?from=admin&tab=posts' : categoryParam}`)}
                style={{ backgroundColor: '#e8eaf6', color: '#5c6bc0', fontWeight: '600' }}>수정</button>
              <button onClick={handleDelete} style={{ backgroundColor: '#fce4ec', color: '#e57373', fontWeight: '600' }}>삭제</button>
            </>
          )}
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div style={{backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: isMobile ? '20px' : '40px', marginTop: '16px', overflow: 'hidden'}}>
        <h2 style={{fontSize: '18px', fontWeight: '700', color: '#3f3f3f', marginBottom: '24px'}}>
          댓글 {parentComments.length}개
        </h2>

        {user ? (
          <div style={{display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'flex-start'}}>
            {getAvatar(profile?.nickname || user.email)}
            <div style={{flex: 1}}>
              <input value={commentInput} onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
                placeholder="댓글 추가..."
                style={{width: '100%', padding: '8px 0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', border: 'none', borderBottom: '2px solid #e0e0e0', backgroundColor: 'transparent'}}
              />
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px'}}>
                <button onClick={() => setCommentInput('')}
                  style={{backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 12px', borderRadius: '20px'}}>취소</button>
                <button onClick={handleCommentSubmit}
                  style={{backgroundColor: commentInput.trim() ? '#5c6bc0' : '#e0e0e0', color: commentInput.trim() ? '#fff' : '#999', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 16px', borderRadius: '20px'}}>댓글</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '20px', color: '#999', fontSize: '14px', marginBottom: '24px', backgroundColor: '#f8f9ff', borderRadius: '12px'}}>
            <span onClick={() => navigate('/login')} style={{color: '#5c6bc0', cursor: 'pointer', fontWeight: '600'}}>로그인</span> 후 댓글을 작성할 수 있습니다.
          </div>
        )}

        {parentComments.map(comment => (
          <div key={comment.id} style={{marginBottom: '24px'}}>
            {renderNode(comment, comment.id, true)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostDetail;