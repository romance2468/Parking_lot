import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { loginStore } from '../stores/loginStore';
import { landingStore } from '../stores/landingStore';

const Login: React.FC = observer(() => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginStore.submit();
    if (loginStore.loginSuccess) {
      landingStore.setLoggedIn(true);
      const { token: t, refreshToken: rt, user: u } = loginStore.loginSuccess;
      loginStore.clearLoginSuccess();
      navigate('/profile', { replace: true, state: { token: t, refreshToken: rt, user: u } });
    }
  };

  return (
    <div className="login-page">
      {/* Gray #8 Background with More Visible Bubbles */}
      <div className="gray-bg">
        {loginStore.bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* Login Card */}
      <div className="login-container">
        <div className="login-card">
          {/* Big Animated Logo */}
          <div className="logo-container">
            <div className="logo-circle">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="20" width="40" height="30" rx="4" stroke="white" strokeWidth="3" fill="transparent" />
                <path d="M28 30V40M42 30V40" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="25" cy="55" r="5" fill="white" />
                <circle cx="45" cy="55" r="5" fill="white" />
                <path d="M35 10V20M48 14L42 20M22 14L28 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <rect x="35" y="30" width="4" height="10" fill="white" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-main">СИТИ</span>
              <span className="logo-highlight">ПАРК</span>
            </div>
          </div>

          <h2 className="login-title">Вход в систему</h2>
          
          {loginStore.error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {loginStore.error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Электронная почта</label>
              <input
                type="email"
                value={loginStore.email}
                onChange={(e) => loginStore.setEmail(e.target.value)}
                placeholder="example@mail.ru"
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={loginStore.password}
                onChange={(e) => loginStore.setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={loginStore.rememberMe}
                  onChange={(e) => loginStore.setRememberMe(e.target.checked)}
                />
                <span>Запомнить меня</span>
              </label>
              <button type="button" className="forgot-link">Забыли пароль?</button>
            </div>

            <button type="submit" className="login-button" disabled={loginStore.loading}>
              {loginStore.loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

         

          <div className="register-link">
            Нет аккаунта? <button type="button" className="register-link-btn">Свяжитесь с администратором</button>
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Gray #8 Background with More Visible Bubbles */
        .gray-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #b8c3d4; /* Color #8 - Darker gray */
          z-index: 1;
          overflow: hidden;
        }

        .bubble {
          position: absolute;
          bottom: -100px;
          background: rgba(37, 99, 235, 0.15); /* More opaque */
          border-radius: 50%;
          pointer-events: none;
          animation: floatUp linear infinite;
          border: 2px solid rgba(37, 99, 235, 0.25); /* Thicker border */
          box-shadow: 0 0 40px rgba(37, 99, 235, 0.2); /* Stronger glow */
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.9; /* More visible */
          }
          100% {
            transform: translateY(-120vh) scale(1.3);
            opacity: 0.2;
          }
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 450px;
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: cardAppear 0.5s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Big Animated Logo */
        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
        }

        .logo-circle {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3);
          animation: logoFloat 3s ease-in-out infinite;
          border: 3px solid white;
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }

        .logo-text {
          font-size: 32px;
          font-weight: 700;
        }

        .logo-main {
          color: #1e293b;
        }

        .logo-highlight {
          color: #2563eb;
        }

        .login-title {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
          text-align: center;
          margin-bottom: 30px;
        }

        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-icon {
          font-size: 18px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
          background: #f8fafc;
        }

        .form-group input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          transform: scale(1.01);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #4b5563;
        }

        .remember-me input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #2563eb;
        }

        .forgot-link {
          background: none;
          border: none;
          padding: 0;
          color: #2563eb;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          margin-bottom: 15px;
        }

        .login-button:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        }

        .temp-login-note {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
          border: 1px dashed #d1d5db;
        }

        .register-link {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .register-link .register-link-btn {
          background: none;
          border: none;
          padding: 0;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
        }

        .register-link .register-link-btn:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .login-card {
            padding: 30px 20px;
          }
          
          .logo-circle {
            width: 100px;
            height: 100px;
          }
          
          .logo-circle svg {
            width: 60px;
            height: 60px;
          }
          
          .logo-text {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
});

export default Login;