import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Function to save scroll position
    const saveScrollPosition = () => {
      sessionStorage.setItem(`scrollPosition-${pathname}`, window.scrollY);
    };

    // Function to restore scroll position
    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem(`scrollPosition-${pathname}`);
      if (savedPosition) {
        // Use setTimeout to ensure the DOM is fully rendered
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition));
        }, 0);
      } else {
        window.scrollTo(0, 0);
      }
    };

    // Save scroll position when leaving the page
    window.addEventListener('beforeunload', saveScrollPosition);

    // Restore scroll position when the page loads
    restoreScrollPosition();

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [pathname]);
};

export default useScrollToTop; 