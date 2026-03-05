import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ParkingSelection: React.FC = () => {
  const navigate = useNavigate();
  
  // State for selected spot and filters
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState('standard');
  const [duration, setDuration] = useState('2');

  // Create bubbles (same as other pages)
  const [bubbles, setBubbles] = useState<Array<{ id: number; size: number; left: number; duration: number; delay: number }>>([]);

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

  // Generate parking spots for each floor
  const generateSpots = (floor: string) => {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const spotsPerRow = 8;
    const spots = [];
    
    for (const row of rows) {
      for (let i = 1; i <= spotsPerRow; i++) {
        const spotNumber = `${row}${i.toString().padStart(2, '0')}`;
        // Random status for demo (in real app, this would come from API)
        const random = Math.random();
        let status: 'available' | 'occupied' | 'selected' | 'disabled' = 'available';
        
        if (spotNumber === selectedSpot) {
          status = 'selected';
        } else if (random < 0.3) {
          status = 'occupied';
        } else if (random < 0.4) {
          status = 'disabled';
        }
        
        // Special spots for different vehicle types
        const spotType = row === 'A' ? 'electric' : (row === 'B' ? 'handicap' : 'standard');
        
        spots.push({
          id: `${floor}-${spotNumber}`,
          number: spotNumber,
          row: row,
          status,
          type: spotType,
          price: spotType === 'electric' ? 300 : (spotType === 'handicap' ? 200 : 150)
        });
      }
    }
    return spots;
  };

  const parkingSpots = generateSpots(selectedFloor);

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

  const handleSpotClick = (spot: any) => {
    if (spot.status === 'available') {
      setSelectedSpot(spot.number);
    }
  };

  const handleContinue = () => {
    if (!selectedSpot) {
      alert('Пожалуйста, выберите место');
      return;
    }
    
    const parkingData = {
      floor: selectedFloor,
      spot: selectedSpot,
      duration: duration,
      vehicleType: vehicleType
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

          {/* Screen Indicator */}
          <div className="screen-indicator">
            <div className="screen">ВЪЕЗД</div>
          </div>

          {/* Parking Grid */}
          <div className="parking-grid">
            {/* Row Labels */}
            <div className="row-labels">
              {['A', 'B', 'C', 'D', 'E'].map(row => (
                <div key={row} className="row-label">{row}</div>
              ))}
            </div>

            {/* Parking Spots */}
            <div className="spots-container">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(spotNum => (
                <div key={spotNum} className="spot-column">
                  <div className="column-number">{spotNum}</div>
                  {['A', 'B', 'C', 'D', 'E'].map(row => {
                    const spot = parkingSpots.find(s => s.number === `${row}${spotNum.toString().padStart(2, '0')}`);
                    if (!spot) return null;
                    
                    return (
                      <div
                        key={`${row}${spotNum}`}
                        className={`parking-spot ${spot.status} ${spot.type}`}
                        style={{
                          backgroundColor: getSpotColor(spot.status, spot.type),
                          border: getSpotBorder(spot.status, spot.type),
                          cursor: spot.status === 'available' ? 'pointer' : 'not-allowed'
                        }}
                        onClick={() => handleSpotClick(spot)}
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
          </div>

          {/* Selected Spot Info */}
          {selectedSpot && (
            <div className="selected-info">
              <div className="selected-spot">
                Выбрано место: <strong>{selectedSpot}</strong> ({selectedFloor} этаж)
              </div>
              <div className="selected-price">
                {parkingSpots.find(s => s.number === selectedSpot)?.price} ₽/час
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

        /* Screen Indicator */
        .screen-indicator {
          margin-bottom: 20px;
          text-align: center;
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