import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, parkingAPI } from '../api';
import type { ParkingPlace } from '../types';

type SpotDisplay = {
  id_parking: number;
  number: string;
  row: string;
  status: 'available' | 'occupied' | 'selected' | 'disabled';
  type: string;
  price: number;
};

const priceByType: Record<string, number> = {
  electric: 300,
  Электрозарядка: 300,
  handicap: 200,
  'для инвалидов': 200,
  standard: 150,
  стандартная: 150,
};

function placeToSpot(place: ParkingPlace, selectedId: number | null): SpotDisplay {
  const number = `${place.section}${place.place_num.toString().padStart(2, '0')}`;
  const typeNorm = (place.type_parking || 'standard').toLowerCase();
  const type = typeNorm.includes('electric') || typeNorm.includes('электр') ? 'electric' : typeNorm.includes('handicap') || typeNorm.includes('инвалид') ? 'handicap' : 'standard';
  const price = priceByType[place.type_parking] ?? priceByType[type] ?? 150;
  return {
    id_parking: place.id_parking,
    number,
    row: place.section,
    status: selectedId === place.id_parking ? 'selected' : place.is_free === 1 ? 'available' : 'occupied',
    type,
    price,
  };
}

const ParkingSelection: React.FC = () => {
  const navigate = useNavigate();
  
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState('standard');
  const [duration, setDuration] = useState('2');

  const [places, setPlaces] = useState<ParkingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bubbles, setBubbles] = useState<Array<{ id: number; size: number; left: number; duration: number; delay: number }>>([]);

  const loadPlaces = useCallback((floor: number) => {
    setLoading(true);
    setError(null);
    parkingAPI.getPlaces(floor)
      .then((res) => {
        setPlaces(res.data.places || []);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message || 'Не удалось загрузить места');
        setPlaces([]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    authAPI.getProfile()
      .then((res) => {
        const carType = res.data?.car?.type;
        if (carType && (String(carType).toLowerCase() === 'electric' || String(carType).toLowerCase().includes('электр'))) {
          setVehicleType('electric');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPlaces(Number(selectedFloor));
    setSelectedSpotId(null);
  }, [selectedFloor, loadPlaces]);

  const parkingSpots: SpotDisplay[] = places.map((p) => placeToSpot(p, selectedSpotId));
  const selectedSpot = selectedSpotId != null ? parkingSpots.find((s) => s.id_parking === selectedSpotId)?.number ?? null : null;

  useEffect(() => {
    if (selectedSpotId == null) return;
    const place = places.find((p) => p.id_parking === selectedSpotId);
    if (!place) return;
    const spot = placeToSpot(place, selectedSpotId);
    if (spot.type !== vehicleType) setSelectedSpotId(null);
  }, [vehicleType, selectedSpotId, places]);

  const getSpotColor = (status: string, type: string) => {
    if (status === 'selected') return '#2563eb';
    if (status === 'occupied') return '#94a3b8';
    if (status === 'disabled') return '#e2e8f0';
    
    switch(type) {
      case 'electric': return '#10b981';
      case 'handicap': return '#f59e0b';
      default: return 'white';
    }
  };

  const getSpotBorder = (status: string, type: string) => {
    if (status === 'selected') return '3px solid white';
    if (status === 'occupied') return '1px solid #64748b';
    if (status === 'disabled') return '1px dashed #cbd5e1';
    
    switch(type) {
      case 'electric': return '2px solid #10b981';
      case 'handicap': return '2px solid #f59e0b';
      default: return '2px solid #2563eb';
    }
  };

  const isSpotSelectableForVehicle = (spot: SpotDisplay) =>
    spot.status === 'available' && spot.type === vehicleType;

  const handleSpotClick = (spot: SpotDisplay) => {
    if (isSpotSelectableForVehicle(spot)) {
      setSelectedSpotId(spot.id_parking);
    }
  };

  const handleRefresh = () => {
    loadPlaces(Number(selectedFloor));
  };

  const handleContinue = () => {
    if (selectedSpotId == null || !selectedSpot) {
      alert('Пожалуйста, выберите место');
      return;
    }
    const spotData = parkingSpots.find((s) => s.id_parking === selectedSpotId);
    const parkingData = {
      floor: selectedFloor,
      spot: selectedSpot,
      id_parking: selectedSpotId,
      type_parking: spotData?.type || vehicleType,
      price: spotData?.price ?? 150,
      duration,
      vehicleType,
    };
    localStorage.setItem('parkingSelection', JSON.stringify(parkingData));
    navigate('/payment');
  };

  return (
    <div className="parking-selection-page">
      {/* Background with bubbles */}
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
      
      {/* Main Content */}
      <div className="content-container">
        <div className="content-card">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo-circle">
              <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="20" width="40" height="30" rx="4" stroke="white" strokeWidth="3" fill="transparent" />
                <path d="M28 30V40M42 30V40" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="25" cy="55" r="5" fill="white" />
                <circle cx="45" cy="55" r="5" fill="white" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-main">СИТИ</span>
              <span className="logo-highlight">ПАРК</span>
            </div>
          </div>

          <h2 className="page-title">Выберите место</h2>

          {/* Filters Row with Professional Dropdowns */}
          <div className="filters-row">
            <div className="filter-group">
              <label>Этаж</label>
              <select 
                value={selectedFloor} 
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="filter-select"
              >
                <option value="1">1 этаж</option>
                <option value="2">2 этаж</option>
                <option value="3">3 этаж</option>
                <option value="4">4 этаж</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Тип авто</label>
              <select 
                value={vehicleType} 
                onChange={(e) => setVehicleType(e.target.value)}
                className="filter-select"
              >
                <option value="standard">Стандарт</option>
                <option value="electric">Электромобиль</option>
                <option value="handicap">Для инвалидов</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Часов</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="filter-select"
              >
                <option value="1">1 час</option>
                <option value="2">2 часа</option>
                <option value="3">3 часа</option>
                <option value="4">4 часа</option>
                <option value="6">6 часов</option>
                <option value="8">8 часов</option>
                <option value="12">12 часов</option>
                <option value="24">24 часа</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ color: '#dc2626', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {/* Legend */}
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Свободно</span>
            </div>
            <div className="legend-item">
              <div className="legend-color electric"></div>
              <span>Электрозарядка</span>
            </div>
            <div className="legend-item">
              <div className="legend-color handicap"></div>
              <span>Для инвалидов</span>
            </div>
            <div className="legend-item">
              <div className="legend-color occupied"></div>
              <span>Занято</span>
            </div>
            <div className="legend-item">
              <div className="legend-color selected"></div>
              <span>Выбрано</span>
            </div>
          </div>

          {/* Screen Indicator + Refresh */}
          <div className="screen-indicator">
            <div className="screen">ВЪЕЗД</div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-btn-round"
              title="Обновить места"
              aria-label="Обновить места"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.636-6.364M21 3v6h-6" />
              </svg>
            </button>
          </div>

          {/* Parking Grid */}
          <div className="parking-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#64748b' }}>
                Загрузка мест…
              </div>
            ) : (
              <>
                <div className="row-labels">
                  {['A', 'B', 'C', 'D', 'E'].map(row => (
                    <div key={row} className="row-label">{row}</div>
                  ))}
                </div>
                <div className="spots-container">
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(spotNum => (
                    <div key={spotNum} className="spot-column">
                      <div className="column-number">{spotNum}</div>
                      {['A', 'B', 'C', 'D', 'E'].map(row => {
                        const spot = parkingSpots.find(s => s.number === `${row}${spotNum.toString().padStart(2, '0')}`);
                        if (!spot) return <div key={`${row}-${spotNum}`} className="parking-spot disabled" style={{ backgroundColor: '#e2e8f0', border: '1px dashed #cbd5e1' }} />;
                        const selectable = isSpotSelectableForVehicle(spot);
                        const availableButWrongType = spot.status === 'available' && spot.type !== vehicleType;
                        return (
                          <div
                            key={`${row}${spotNum}`}
                            className={`parking-spot ${spot.status} ${spot.type} ${availableButWrongType ? 'wrong-type' : ''}`}
                            style={{
                              backgroundColor: getSpotColor(spot.status, spot.type),
                              border: getSpotBorder(spot.status, spot.type),
                              cursor: selectable ? 'pointer' : 'not-allowed',
                              opacity: availableButWrongType ? 0.55 : 1
                            }}
                            onClick={() => handleSpotClick(spot)}
                            title={availableButWrongType ? `Место для типа «${spot.type === 'electric' ? 'Электромобиль' : spot.type === 'handicap' ? 'Для инвалидов' : 'Стандарт'}». Выбран тип «${vehicleType === 'electric' ? 'Электромобиль' : vehicleType === 'handicap' ? 'Для инвалидов' : 'Стандарт'}».` : undefined}
                          >
                            <span className="spot-number">{spot.number}</span>
                            {spot.type === 'electric' && <span className="spot-icon">⚡</span>}
                            {spot.type === 'handicap' && <span className="spot-icon">♿</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Selected Spot Info */}
          {selectedSpot && (
            <div className="selected-info">
              <div className="selected-spot">
                Выбрано место: <strong>{selectedSpot}</strong> ({selectedFloor} этаж)
              </div>
              <div className="selected-price">
                {(() => {
                  const spotData = parkingSpots.find(s => s.number === selectedSpot);
                  const pricePerHour = spotData?.price ?? 150;
                  const hours = Number(duration) || 1;
                  const total = pricePerHour * hours;
                  return (
                    <>
                      {pricePerHour} ₽/час × {hours} {hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} = <strong>{total} ₽</strong>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="button-group">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              ← Назад
            </button>
            
            <button
              type="button"
              onClick={handleContinue}
              className="btn btn-primary"
              disabled={!selectedSpot}
            >
              Продолжить →
            </button>
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

        .parking-selection-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
        }

        /* Same background as other pages */
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
          max-width: 900px;
        }

        .content-card {
          background: white;
          border-radius: 30px;
          padding: 30px;
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
          margin-bottom: 15px;
        }

        .logo-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3);
          animation: logoFloat 3s ease-in-out infinite;
          border: 3px solid white;
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }

        .logo-text {
          font-size: 24px;
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
          margin-bottom: 20px;
        }

        /* Filters with Professional Dropdown Arrows */
        .filters-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-group label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .filter-select {
          padding: 12px 35px 12px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          background: #f8fafc;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 18px;
        }

        .filter-select:hover {
          border-color: #2563eb;
          background-color: white;
        }

        .filter-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        /* Legend */
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
          margin-bottom: 20px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #475569;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .legend-color.available {
          background: white;
          border: 2px solid #2563eb;
        }
        .legend-color.electric {
          background: #10b981;
        }
        .legend-color.handicap {
          background: #f59e0b;
        }
        .legend-color.occupied {
          background: #94a3b8;
        }
        .legend-color.selected {
          background: #2563eb;
        }

        /* Screen Indicator + Round Refresh */
        .screen-indicator {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .screen {
          display: inline-block;
          padding: 8px 30px;
          background: #1e293b;
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 2px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .refresh-btn-round {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid #2563eb;
          background: white;
          color: #2563eb;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s, transform 0.2s;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }
        .refresh-btn-round:hover:not(:disabled) {
          background: #2563eb;
          color: white;
          transform: scale(1.05);
        }
        .refresh-btn-round:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .refresh-btn-round svg {
          flex-shrink: 0;
        }

        /* Parking Grid */
        .parking-grid {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          background: #f1f5f9;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .row-labels {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 30px;
        }

        .row-label {
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #2563eb;
          background: white;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }

        .spots-container {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;
        }

        .spot-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .column-number {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .parking-spot {
          height: 50px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          transition: all 0.2s;
          position: relative;
        }

        .parking-spot:hover:not(.occupied):not(.disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
        }

        .parking-spot.occupied {
          color: white;
          cursor: not-allowed;
          opacity: 0.8;
        }

        .parking-spot.disabled {
          background: #e2e8f0;
          border: 1px dashed #94a3b8;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .spot-number {
          font-size: 11px;
          font-weight: 700;
        }

        .spot-icon {
          font-size: 10px;
          margin-top: 2px;
        }

        /* Selected Info */
        .selected-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f0f9ff;
          border: 2px solid #2563eb;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .selected-spot {
          font-size: 15px;
          color: #1e293b;
        }

        .selected-spot strong {
          color: #2563eb;
          font-size: 18px;
        }

        .selected-price {
          font-size: 20px;
          font-weight: 700;
          color: #2563eb;
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
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .filters-row {
            grid-template-columns: 1fr;
          }
          
          .parking-grid {
            flex-direction: column;
          }
          
          .row-labels {
            flex-direction: row;
            width: 100%;
          }
          
          .spots-container {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .button-group {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ParkingSelection;