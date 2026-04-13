import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { LoginCredentials, RegisterData } from '../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create bubbles (same as login page)
  const [bubbles, setBubbles] = useState<Array<{ id: number; size: number; left: number; duration: number; delay: number }>>([]);

  React.useEffect(() => {
    // Generate bubbles (same as login page)
    const newBubbles = [];
    for (let i = 0; i < 40; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * 50 + 25,
        left: Math.random() * 100,
        duration: Math.random() * 25 + 20,
        delay: Math.random() * 8
      });
    }
    setBubbles(newBubbles);
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const credentials: RegisterData = {
        email,
        password,
        name
      };
      
      const response = await authAPI.register(credentials);
      const { token, refreshToken, user } = response.data;
      if (!token || !refreshToken || !user?.id) {
        setError('Ошибка: не получены данные пользователя');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      setSuccess(true);
      navigate('/car-details', { state: { fromRegister: true, token, refreshToken, userId: user.id } });
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Ошибка регистрации');
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                required
              />
            </div>

            <div className="form-group">
              <label>Электронная почта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            Уже есть аккаунт? <a href="#" onClick={() => navigate('/login')}>Войти</a>
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

        .login-link a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        .login-link a:hover {
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