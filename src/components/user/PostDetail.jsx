import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api';
import { supabase } from '../../supabase';

const ReplyInput = ({ replyInputText, setReplyInputText, onSubmit, onCancel, profile, user, getAvatar }) => (
  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'flex-start' }}>
    {getAvatar(profile?.nickname || user?.email, profile?.avatar_url)}
    <div style={{ flex: 1, minWidth: 0 }}>
      <input
        value={replyInputText}
        onChange={e => setReplyInputText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder="답글 추가..."
        style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '2px solid #e0e0e0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: 'transparent' }}
        autoFocus
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
        <button onClick={onCancel} style={{ backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 12px', borderRadius: '20px' }}>취소</button>
        <button onClick={onSubmit} style={{ backgroundColor: replyInputText.trim() ? '#5c6bc0' : '#e0e0e0', color: replyInputText.trim() ? '#fff' : '#999', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 16px', borderRadius: '20px' }}>답글</button>
      </div>
    </div>
  </div>
);

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
  const [profilesMap, setProfilesMap] = useState({});
  const [lastSubmittedId, setLastSubmittedId] = useState(null);
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
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
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
    if (lastSubmittedId) {
      const timer = setTimeout(() => setLastSubmittedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSubmittedId]);

  const loadComments = useCallback(async () => {
    const res = await api.get(`/comments/post/${id}`);
    const commentList = res.data;
    setComments(commentList);
    const userIds = [...new Set(commentList.map(c => c.userId).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, avatar_url').in('id', userIds);
      if (profiles) {
        const map = {};
        profiles.forEach(p => { map[p.id] = p.avatar_url; });
        setProfilesMap(map);
      }
    } else {
      setProfilesMap({});
    }
  }, [id]);

  useEffect(() => {
    api.get(`/posts/${id}`).then(res => setPost(res.data));
    loadComments();
  }, [id, loadComments]);

  const handleDelete = () => {
    if (window.confirm('삭제하시겠습니까?')) {
      api.delete(`/posts/${id}`).then(() => goBack());
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    if (!user) { alert('로그인이 필요합니다.'); return; }
    const res = await api.post('/comments', {
      postId: parseInt(id), content: commentInput,
      author: profile?.nickname || user.email, userId: user.id, parentId: null,
    });
    if (res.data?.id) setLastSubmittedId(res.data.id);
    setCommentInput('');
    loadComments();
  };

  const handleReplySubmit = async (rootCommentId) => {
    if (!replyInputText.trim()) return;
    if (!user) { alert('로그인이 필요합니다.'); return; }
    const res = await api.post('/comments', {
      postId: parseInt(id), content: replyInputText,
      author: profile?.nickname || user.email, userId: user.id, parentId: replyTargetId,
    });
    if (res.data?.id) setLastSubmittedId(res.data.id);
    setActiveReplyId(null);
    setReplyInputText('');
    setReplyTargetId(null);
    setShowReplies(prev => ({ ...prev, [rootCommentId]: true }));
    loadComments();
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await api.delete(`/comments/${commentId}`);
    loadComments();
  };

  const handleCommentEdit = async (commentId) => {
    await api.put(`/comments/${commentId}`, { content: editInput });
    setLastSubmittedId(commentId);
    setEditingId(null);
    loadComments();
  };

  const handleLike = async (commentId) => {
    if (!user) { alert('로그인이 필요합니다.'); return; }
    await api.post(`/comments/${commentId}/like?userId=${user.id}`);
    loadComments();
  };

  // 모바일에서 아바타 크기 줄이기
  const avatarSize = isMobile ? 28 : 36;
  const AVATAR_GAP = isMobile ? 8 : 12;
  const LINE_LEFT = `-${8 + AVATAR_GAP + avatarSize / 2}px`;   // padding(8) + gap + 아바타 중앙
  const LINE_WIDTH = `${AVATAR_GAP + avatarSize / 2 - 4}px`;   // 세로선 → 자식 아바타 왼쪽까지

  const getAvatar = (author, avatarUrl) => (
    avatarUrl ? (
      <img src={avatarUrl} alt={author} style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    ) : (
      <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', backgroundColor: '#5c6bc0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 12 : 15, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
        {author?.[0]?.toUpperCase() || '?'}
      </div>
    )
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

  const ActionButtons = ({ item, rootCommentId, isRoot = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
      <button onClick={() => handleLike(item.id)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', borderRadius: '20px' }}>
        👍 {item.likeCount > 0 && <span style={{ fontSize: '12px' }}>{item.likeCount}</span>}
      </button>
      <button style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', padding: '6px 8px', borderRadius: '20px' }}>👎</button>
      {user && (
        <button onClick={() => { setActiveReplyId(item.id); setReplyInputText(isRoot ? '' : `@${item.author} `); setReplyTargetId(item.id); }}
          style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#3f3f3f', padding: '6px 12px', borderRadius: '20px' }}>답글</button>
      )}
      {user && (user.id === item.userId || user.email === ADMIN_EMAIL) && (
        <>
          <button onClick={() => { setEditingId(item.id); setEditInput(item.content); }}
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#888', padding: '6px 8px', borderRadius: '20px' }}>수정</button>
          <button onClick={() => handleCommentDelete(item.id)}
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#e57373', padding: '6px 8px', borderRadius: '20px' }}>삭제</button>
        </>
      )}
    </div>
  );

  const renderNode = (item, rootCommentId, isRoot = false, depth = 0) => {
    const children = getDirectReplies(item.id);
    const hasChildren = children.length > 0;
    const showChildren = isRoot ? showReplies[item.id] : true;
    const isNew = String(item.id) === String(lastSubmittedId);

    return (
      <div style={{ display: 'flex', gap: `${AVATAR_GAP}px`, position: 'relative' }}>
        <div style={{ flexShrink: 0, width: `${avatarSize}px`, zIndex: 1 }}>
          {getAvatar(item.author, profilesMap[item.userId])}
        </div>

        <div
          className={isNew ? 'new-comment-flash' : ''}
          style={{ flex: 1, minWidth: 0, padding: '4px 8px', borderRadius: '12px', transition: 'background-color 1s ease-out', backgroundColor: isNew ? 'rgba(92, 107, 192, 0.1)' : 'transparent' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '700', fontSize: isMobile ? '12px' : '13px', color: '#3f3f3f' }}>@{item.author}</span>
            <span style={{ fontSize: isMobile ? '11px' : '12px', color: '#aaa' }}>
              {formatTimeAgo(item.createdAt)}
              {item.updatedAt && 
              Math.floor(new Date(item.updatedAt).getTime() / 1000) !== Math.floor(new Date(item.createdAt).getTime() / 1000) && (
                <span style={{ marginLeft: '6px', fontSize: '11px', color: '#bbb' }}>(수정됨)</span>
              )}
            </span>
          </div>

          {editingId === item.id ? (
            <div style={{ marginBottom: '8px' }}>
              <input value={editInput} onChange={e => setEditInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCommentEdit(item.id)}
                style={{ width: '100%', padding: '6px 0', border: 'none', borderBottom: '2px solid #5c6bc0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: 'transparent' }}
                autoFocus />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setEditingId(null)} style={{ backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '6px 12px', borderRadius: '20px' }}>취소</button>
                <button onClick={() => handleCommentEdit(item.id)} style={{ backgroundColor: '#5c6bc0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '6px 16px', borderRadius: '20px' }}>저장</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: '#444', margin: '0 0 8px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{item.content}</p>
              <ActionButtons item={item} rootCommentId={rootCommentId} isRoot={isRoot} depth={depth} />
            </>
          )}

          {/* 답글 입력창 */}
          {activeReplyId === item.id && (
            <div style={{ position: 'relative', marginTop: '12px', paddingTop: '12px' }}>
              <div style={{
                position: 'absolute',
                left: LINE_LEFT,
                top: `${-(avatarSize + AVATAR_GAP)}px`,   // 부모 아바타 위쪽까지
                bottom: `${avatarSize / 2 + 38}px`,              // 입력창 아바타 중앙까지
                width: LINE_WIDTH,
                borderLeft: '1.5px solid #ebebeb',
                borderBottom: '1.5px solid #ebebeb',
                borderBottomLeftRadius: '22px'
              }} />
              {hasChildren && showChildren && (
                <div style={{ position: 'absolute', left: LINE_LEFT, top: '0px', bottom: '-12px', borderLeft: '1.5px solid #ebebeb' }} />
              )}
              <ReplyInput
                replyInputText={replyInputText}
                setReplyInputText={setReplyInputText}
                onSubmit={() => handleReplySubmit(rootCommentId)}
                onCancel={() => { setActiveReplyId(null); setReplyInputText(''); setReplyTargetId(null); }}
                profile={profile}
                user={user}
                getAvatar={getAvatar}
              />
            </div>
          )}



          {/* 자식 댓글 - depth 2 이상은 depth 1에서 flat하게 처리 */}
{hasChildren && showChildren && depth < 2 && (
  <div style={{ marginTop: '12px' }}>
    {(depth === 1
      ? getAllDescendants(item.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      : children
    ).map((child, index, arr) => (
      <div key={child.id} style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: LINE_LEFT,
          top: '-51px',
          width: LINE_WIDTH,
          height: '82px',
          borderLeft: '1.5px solid #ebebeb',
          borderBottom: '1.5px solid #ebebeb',
          borderBottomLeftRadius: '22px'
        }} />
        {index !== arr.length - 1 && (
          <div style={{ position: 'absolute', left: LINE_LEFT, top: '0px', bottom: '-12px', borderLeft: '1.5px solid #ebebeb' }} />
        )}
        <div style={{ paddingTop: '12px' }}>
          {renderNode(child, rootCommentId, false, depth === 1 ? 2 : depth + 1)}
        </div>
      </div>
    ))}
  </div>
)}




          {isRoot && hasChildren && (
            <button onClick={() => setShowReplies(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#5c6bc0', fontWeight: '700', fontSize: '14px', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {showReplies[item.id] ? `▲ 답글 숨기기` : `▼ 답글 ${getAllRepliesCount(item.id)}개`}
            </button>
          )}
        </div>
      </div>
    );
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
        <p style={{ fontSize: '16px', lineHeight: '1.9', color: '#444', whiteSpace: 'pre-wrap', minHeight: '200px', wordBreak: 'break-word' }}>{post.content}</p>

        {post.imageUrl && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <img src={post.imageUrl} alt="첨부 이미지" onClick={() => setShowModal(true)}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px', cursor: 'zoom-in', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
            </div>
            {showModal && (
              <div onClick={() => setShowModal(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
                <img src={post.imageUrl} alt="첨부 이미지" style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} />
                <div style={{ position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '36px', cursor: 'pointer', fontWeight: '300' }}>✕</div>
              </div>
            )}
          </>
        )}

        {post.youtubeUrl && getYoutubeEmbedUrl(post.youtubeUrl) && (
          <div style={{ marginBottom: '32px' }}>
            <iframe key={post.youtubeUrl} width="100%" height={isMobile ? '220' : '450'}
              src={getYoutubeEmbedUrl(post.youtubeUrl)} frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen style={{ borderRadius: '12px' }} />
          </div>
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

      {/* 댓글 섹션 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: isMobile ? '16px' : '40px', marginTop: '16px', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#3f3f3f', marginBottom: '24px' }}>댓글 {parentComments.length}개</h2>

        {user ? (
          <div style={{ display: 'flex', gap: `${AVATAR_GAP}px`, marginBottom: '32px', alignItems: 'flex-start' }}>
            {getAvatar(profile?.nickname || user.email, profile?.avatar_url)}
            <div style={{ flex: 1, minWidth: 0 }}>
              <input value={commentInput} onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
                placeholder="댓글 추가..."
                style={{ width: '100%', padding: '8px 0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', border: 'none', borderBottom: '2px solid #e0e0e0', backgroundColor: 'transparent' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setCommentInput('')} style={{ backgroundColor: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 12px', borderRadius: '20px' }}>취소</button>
                <button onClick={handleCommentSubmit} style={{ backgroundColor: commentInput.trim() ? '#5c6bc0' : '#e0e0e0', color: commentInput.trim() ? '#fff' : '#999', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: '8px 16px', borderRadius: '20px' }}>댓글</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '14px', marginBottom: '24px', backgroundColor: '#f8f9ff', borderRadius: '12px' }}>
            <span onClick={() => navigate('/login')} style={{ color: '#5c6bc0', cursor: 'pointer', fontWeight: '600' }}>로그인</span> 후 댓글을 작성할 수 있습니다.
          </div>
        )}

        {/* 각 댓글 overflow hidden으로 선 삐져나옴 방지 */}
        {parentComments.map(comment => (
          <div key={comment.id} style={{ marginBottom: '24px', overflow: 'hidden' }}>
            {renderNode(comment, comment.id, true)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostDetail;
