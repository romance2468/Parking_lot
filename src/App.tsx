import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import CarDetails from './components/CarDetails';
import Profile from './components/Profile';
import ParkingSelection from './components/ParkingSelection'; // ADD THIS LINE

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/car-details" element={<CarDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/parking-selection" element={<ParkingSelection />} /> {/* ADD THIS LINE */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;