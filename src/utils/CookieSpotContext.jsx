import React, { createContext, useContext, useState } from 'react';

const CookieSpotContext = createContext();

export const useCookieSpot = () => {
  const context = useContext(CookieSpotContext);
  if (!context) {
    throw new Error('useCookieSpot must be used within a CookieSpotProvider');
  }
  return context;
};

export const CookieSpotProvider = ({ children }) => {
  const [selectedCookieSpot, setSelectedCookieSpot] = useState(null);
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const value = {
    selectedCookieSpot,
    setSelectedCookieSpot,
    favoriteSpots,
    setFavoriteSpots,
    recentlyViewed,
    setRecentlyViewed
  };

  return (
    <CookieSpotContext.Provider value={value}>
      {children}
    </CookieSpotContext.Provider>
  );
}; 