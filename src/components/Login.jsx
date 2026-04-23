import { supabase } from '../supabase';

function Login() {
    const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
        redirectTo: 'https://board-pjw.vercel.app'
        }
    });
    if (error) alert('로그인 실패: ' + error.message);
    };

  return (
    <div style={{
      maxWidth: '400px', margin: '80px auto', padding: '0 24px'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#3f3f3f', marginBottom: '8px'}}>
          로그인
        </h1>
        <p style={{fontSize: '14px', color: '#999', marginBottom: '32px'}}>
          소셜 계정으로 간편하게 로그인하세요
        </p>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: '#FEE500', color: '#000',
            border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: '700',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
            alt="kakao" style={{width: '24px', height: '24px'}} />
          카카오로 로그인
        </button>
      </div>
    </div>
  );
}

export default Login;