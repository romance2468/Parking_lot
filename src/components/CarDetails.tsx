import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { carAPI } from '../api';

const CarDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { fromRegister?: boolean; token?: string; refreshToken?: string; userId?: number } | undefined;
  
  // Form state
  const [licensePlate, setLicensePlate] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('sedan');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create bubbles (same as login page)
  const [bubbles, setBubbles] = useState<Array<{ id: number; size: number; left: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    if (state?.token) {
      localStorage.setItem('token', state.token);
    }
    if (state?.refreshToken) {
      localStorage.setItem('refreshToken', state.refreshToken);
    }
  }, [state?.token, state?.refreshToken]);

  useEffect(() => {
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

  const vehicleTypes = [
    { id: 'sedan', label: 'Седан', icon: '🚗' },
    { id: 'suv', label: 'Внедорожник', icon: '🚙' },
    { id: 'hatchback', label: 'Хэтчбек', icon: '🚕' },
    { id: 'electric', label: 'Электро', icon: '⚡' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licensePlate.trim()) {
      setError('Пожалуйста, введите номер автомобиля');
      return;
    }

    if (!agreeToTerms) {
      setError('Пожалуйста, согласитесь с условиями');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const carDetails = {
      licensePlate,
      carModel,
      carColor,
      vehicleType: selectedVehicleType,
      additionalNotes,
      entryTime: new Date().toISOString()
    };
    localStorage.setItem('carDetails', JSON.stringify(carDetails));

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await carAPI.createCar({
          autoNumber: licensePlate.trim(),
          type: selectedVehicleType,
          mark: carModel.trim(),
          color: carColor.trim(),
          notes: additionalNotes.trim()
        });
        setIsSubmitting(false);
        const savedCar = res.data?.car;
        navigate('/parking-selection', { state: savedCar ? { car: savedCar } : undefined });
        return;
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Ошибка сохранения автомобиля');
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    navigate('/parking-selection');
  };

  return (
    <div className="car-details-page">
      {/* Gray Background with Bubbles */}
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
      
      {/* Content Container */}
      <div className="content-container">
        <div className="content-card">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo-circle">
              <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          <h2 className="page-title">Данные автомобиля</h2>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Vehicle Type Selection */}
            <div className="form-group">
              <label>Тип автомобиля</label>
              <div className="vehicle-types">
                {vehicleTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    className={`vehicle-type-btn ${selectedVehicleType === type.id ? 'selected' : ''}`}
                    onClick={() => setSelectedVehicleType(type.id)}
                  >
                    <span className="vehicle-icon">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* License Plate */}
            <div className="form-group">
              <label>Номер автомобиля <span className="required">*</span></label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="А123ВС"
                className="form-input"
                required
              />
            </div>

            {/* Two columns for Model and Color */}
            <div className="row">
              <div className="form-group">
                <label>Марка и модель</label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Toyota Camry"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Цвет</label>
                <input
                  type="text"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  placeholder="Черный"
                  className="form-input"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <label>Дополнительные заметки</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Особые пожелания, нужна зарядка для электромобиля и т.д."
                rows={3}
                className="form-textarea"
              />
            </div>

            {/* Terms */}
            <div className="terms-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <span>Я согласен с <a href="#" className="terms-link">условиями использования</a></span>
              </label>
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline"
              >
                ← Назад
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Сохранение...' : 'Продолжить →'}
              </button>
            </div>
          </form>
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

        .car-details-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
        }

        /* Same background as login page */
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

        .content-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 600px;
        }

        .content-card {
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

        /* Logo - same as login */
        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .logo-circle {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3);
          animation: logoFloat 3s ease-in-out infinite;
          border: 3px solid white;
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }

        .logo-text {
          font-size: 28px;
          font-weight: 700;
        }

        .logo-main {
          color: #1e293b;
        }

        .logo-highlight {
          color: #2563eb;
        }

        .page-title {
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

        .required {
          color: #dc2626;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
          background: #f8fafc;
        }

        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          transform: scale(1.01);
        }

        .form-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
          background: #f8fafc;
          font-family: inherit;
          resize: vertical;
        }

        .form-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          transform: scale(1.01);
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        /* Vehicle Types */
        .vehicle-types {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .vehicle-type-btn {
          padding: 12px 0;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .vehicle-type-btn:hover {
          border-color: #2563eb;
          background: #f0f4ff;
        }

        .vehicle-type-btn.selected {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }

        .vehicle-icon {
          font-size: 24px;
        }

        /* Terms */
        .terms-group {
          margin-bottom: 30px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: #4b5563;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #2563eb;
        }

        .terms-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        /* Buttons */
        .button-group {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 15px;
        }

        .btn {
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .btn-outline {
          background: white;
          border: 2px solid #2563eb;
          color: #2563eb;
        }

        .btn-outline:hover {
          background: #f0f4ff;
          transform: translateY(-2px);
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .content-card {
            padding: 30px 20px;
          }

          .vehicle-types {
            grid-template-columns: repeat(2, 1fr);
          }

          .row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .button-group {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CarDetails;