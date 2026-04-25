import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
      setTimeout(() => passwordRef.current?.focus(), 100);
    }
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (rememberEmail) {
      localStorage.setItem('savedEmail', email);
    } else {
      localStorage.removeItem('savedEmail');
    }
    setLoading(true);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert('회원가입 실패: ' + error.message);
      } else {
        // 랜덤 닉네임 생성 후 profiles 저장
        const adjectives = ['행복한', '신나는', '멋진', '귀여운', '씩씩한', '즐거운', '활발한', '엉뚱한'];
        const nouns = ['호랑이', '토끼', '펭귄', '고양이', '강아지', '코알라', '판다', '여우'];
        const number = Math.floor(Math.random() * 9000) + 1000;
        const nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;

        await supabase.from('profiles').insert({
          id: data.user.id,
          nickname,
        });

        alert('회원가입 성공! 이메일을 확인해주세요.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('로그인 실패: ' + error.message);
      else navigate('/');
    }
    setLoading(false);
  };

  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: 'https://board-pjw.vercel.app' }
    });
    if (error) alert('로그인 실패: ' + error.message);
  };

  return (
    <div style={{maxWidth: '400px', margin: '80px auto', padding: '0 24px'}}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#3f3f3f', marginBottom: '8px'}}>
          {isSignUp ? '회원가입' : '로그인'}
        </h1>
        <p style={{fontSize: '14px', color: '#999', marginBottom: '32px'}}>
          소셜 또는 이메일로 로그인하세요
        </p>

        <div style={{marginBottom: '12px', textAlign: 'left'}}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', boxSizing: 'border-box'}}
          />
        </div>
        <div style={{marginBottom: '12px', textAlign: 'left'}}>
          <input
            ref={passwordRef}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
            style={{width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', boxSizing: 'border-box'}}
          />
        </div>

        {/* 아이디 기억하기 */}
        {!isSignUp && (
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', textAlign: 'left'}}>
            <input
              type="checkbox"
              id="rememberEmail"
              checked={rememberEmail}
              onChange={e => setRememberEmail(e.target.checked)}
              style={{width: '16px', height: '16px', cursor: 'pointer'}}
            />
            <label htmlFor="rememberEmail" style={{fontSize: '14px', color: '#666', cursor: 'pointer'}}>
              아이디 기억하기
            </label>
          </div>
        )}

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: '#5c6bc0', color: '#fff',
            border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: '700',
            cursor: 'pointer', marginBottom: '12px'
          }}
        >
          {loading ? '처리중...' : isSignUp ? '회원가입' : '이메일 로그인'}
        </button>

        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
          <div style={{flex: 1, height: '1px', backgroundColor: '#eee'}}></div>
          <span style={{fontSize: '13px', color: '#bbb'}}>또는</span>
          <div style={{flex: 1, height: '1px', backgroundColor: '#eee'}}></div>
        </div>

        <button
          onClick={handleKakaoLogin}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: '#FEE500', color: '#000',
            border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: '700',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '24px'
          }}
        >
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
            alt="kakao" style={{width: '24px', height: '24px'}} />
          카카오로 로그인
        </button>

        <p style={{fontSize: '14px', color: '#999'}}>
          {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{color: '#5c6bc0', fontWeight: '600', cursor: 'pointer', marginLeft: '6px'}}
          >
            {isSignUp ? '로그인' : '회원가입'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;