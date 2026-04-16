import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterData } from '../types';
import { useRegisterMutation } from '../store/parkingApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setError,
  setSuccess,
  setLoading,
  setRegisterBubbles,
} from '../store/slices/registerSlice';
import { setLoggedIn } from '../store/slices/landingSlice';
import { generateBubbles } from '../store/bubbles';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { name, email, password, confirmPassword, error, success, loading, bubbles } = useAppSelector((s) => s.register);
  const [registerMut] = useRegisterMutation();

  useEffect(() => {
    dispatch(setRegisterBubbles(generateBubbles()));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      dispatch(setError('Пожалуйста, заполните все поля'));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(setError('Пароли не совпадают'));
      return;
    }

    if (password.length < 6) {
      dispatch(setError('Пароль должен быть не менее 6 символов'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(''));

    try {
      const credentials: RegisterData = { email, password, name };
      const response = await registerMut(credentials).unwrap();
      const { token, refreshToken, user } = response;
      if (!token || !refreshToken || !user?.id) {
        dispatch(setError('Ошибка: не получены данные пользователя'));
        dispatch(setLoading(false));
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch(setLoading(false));
      dispatch(setSuccess(true));
      dispatch(setLoggedIn(true));
      navigate('/car-details', { state: { fromRegister: true, token, refreshToken, userId: user.id } });
    } catch (err: any) {
      dispatch(setLoading(false));
      const msg = err?.data?.error ?? err?.error ?? 'Ошибка регистрации';
      dispatch(setError(typeof msg === 'string' ? msg : 'Ошибка регистрации'));
    }
  };

  return (
    <div className="register-page">
      {/* Gray #8 Background with Bubbles */}
      <div className="gray-bg">
        {bubbles.map((bubble) => (
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
      
      {/* Register Card */}
      <div className="register-container">
        <div className="register-card">
          {/* Logo */}
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

          <h2 className="register-title">Регистрация</h2>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              Регистрация прошла успешно! Теперь введите данные автомобиля.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => dispatch(setName(e.target.value))}
                placeholder="Введите ваше имя"
                required
              />
            </div>

            <div className="form-group">
              <label>Электронная почта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => dispatch(setEmail(e.target.value))}
                placeholder="example@mail.ru"
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label>Подтвердите пароль</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => dispatch(setConfirmPassword(e.target.value))}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="register-button" disabled={success || loading}>
              {loading ? 'Регистрация...' : success ? 'Регистрация успешна!' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="login-link">
            Уже есть аккаунт? <button type="button" className="login-link-btn" onClick={() => navigate('/login')}>Войти</button>
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

        .register-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Gray #8 Background with Bubbles */
        .gray-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #b8c3d4;
          z-index: 1;
          overflow: hidden;
        }

        .bubble {
          position: absolute;
          bottom: -100px;
          background: rgba(37, 99, 235, 0.15);
          border-radius: 50%;
          pointer-events: none;
          animation: floatUp linear infinite;
          border: 2px solid rgba(37, 99, 235, 0.25);
          box-shadow: 0 0 40px rgba(37, 99, 235, 0.2);
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-120vh) scale(1.3);
            opacity: 0.2;
          }
        }

        .register-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 450px;
          padding: 20px;
        }

        .register-card {
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

        /* Logo */
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

        .register-title {
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

        .success-message {
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-icon {
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

        .register-button {
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

        .register-button:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        }

        .register-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .login-link {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }

        .login-link .login-link-btn {
          background: none;
          border: none;
          padding: 0;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
        }

        .login-link .login-link-btn:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .register-card {
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
};

export default Register;