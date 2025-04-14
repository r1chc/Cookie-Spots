import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { CookieSpotProvider } from './utils/CookieSpotContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import CookieSpotDetailPage from './pages/CookieSpotDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AddCookieSpotPage from './pages/AddCookieSpotPage';
import './styles/index.css';

function App() {
  // Function to handle search
  const handleSearch = (location, locationData) => {
    console.log('Searching for:', location, locationData);
    
    // Build URL params
    const params = new URLSearchParams();
    params.set('location', location);
    
    // Add coordinates if available
    if (locationData && locationData.latitude && locationData.longitude) {
      params.set('lat', locationData.latitude);
      params.set('lng', locationData.longitude);
    }
    
    // Navigate to search results page
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <AuthProvider>
      <CookieSpotProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage onSearch={handleSearch} />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/cookie-spot/:id" element={<CookieSpotDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/add-cookie-spot" element={<AddCookieSpotPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CookieSpotProvider>
    </AuthProvider>
  );
}

export default App;
