import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Simple Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            {/* New Professional Parking Logo */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12H28C30.2091 12 32 13.7909 32 16V26C32 28.2091 30.2091 30 28 30H8C5.79086 30 4 28.2091 4 26V16C4 13.7909 5.79086 12 8 12Z" stroke="white" strokeWidth="2.5" fill="transparent" />
              <path d="M14 18V24M24 18V24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="32" r="3" fill="white" />
              <circle cx="26" cy="32" r="3" fill="white" />
              <path d="M20 6V12M28 8L24 12M12 8L16 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <rect x="18" y="18" width="2" height="6" fill="white" />
            </svg>
            <span className="logo-text">СИТИ<span className="logo-highlight">ПАРК</span></span>
          </div>
          
          <div className="nav-buttons">
            <button className="btn btn-outline" onClick={() => navigate('/login')}>Войти</button>
            <button className="btn btn-primary" onClick={() => navigate('/car-details')}>Забронировать</button>
          </div>
        </div>
      </nav>

      {/* Main Content with Background Image #2 */}
      <main className="main-content">
        <div className="background-image"></div>
        <div className="overlay"></div>
        <div className="content-wrapper">
          <h1 className="main-title">
            Найдите парковку<br />
            <span className="title-highlight">рядом с вами</span>
          </h1>
          
          <p className="main-description">
            Более 150 парковок <br />
            Охрана 24/7 • Лучшие цены
          </p>
          
          <div className="buttons">
            <button className="btn-primary-large" onClick={() => navigate('/car-details')}>
              Забронировать сейчас
            </button>
          </div>
        </div>
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: transparent;
          padding: 18px 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .logo-highlight {
          color: #ffd700;
        }

        .nav-buttons {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 22px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-outline {
          background: transparent;
          border: 1.5px solid white;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .btn-outline:hover {
          background: white;
          color: #1e293b;
          border-color: white;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
        }

        /* Main Content with Background */
        .main-content {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('https://images.pexels.com/photos/1274096/pexels-photo-1274096.jpeg?auto=compress&cs=tinysrgb&w=1600');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .content-wrapper {
          position: relative;
          z-index: 2;
          max-width: 900px;
          padding: 0 20px;
          text-align: center;
          color: white;
        }

        .main-title {
          font-size: 72px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 25px;
          color: white;
          letter-spacing: -1px;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .title-highlight {
          color: #ffd700;
          position: relative;
          display: inline-block;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .main-description {
          font-size: 20px;
          color: white;
          margin-bottom: 45px;
          line-height: 1.6;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .btn-primary-large {
          padding: 18px 50px;
          font-size: 18px;
          font-weight: 600;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          letter-spacing: 0.5px;
        }

        .btn-primary-large:hover {
          background: #1d4ed8;
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-title {
            font-size: 48px;
          }
          
          .main-description {
            font-size: 18px;
          }
          
          .btn-primary-large {
            padding: 16px 40px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;