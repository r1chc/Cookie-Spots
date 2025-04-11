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
  const handleSearch = (location) => {
    console.log('Searching for:', location);
    // In a real app, this would navigate to search results with the location
    window.location.href = `/search?location=${encodeURIComponent(location)}`;
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
