/**
 * IMPORTANT: Scroll Restoration Hook
 * 
 * This hook is critical for maintaining proper scroll position across page navigation,
 * especially on mobile devices. It was developed after extensive testing and multiple
 * iterations to solve complex scroll restoration issues.
 * 
 * CRITICAL REQUIREMENT: This hook MUST be used in ALL page components to ensure consistent
 * scroll behavior across the entire site. When adding new pages, remember to:
 * 1. Import this hook: import useScrollRestoration from '../hooks/useScrollRestoration';
 * 2. Call it in the component: useScrollRestoration();
 * 
 * Key Learnings:
 * 1. Scroll restoration MUST be handled in ONE place only (this hook)
 * 2. DO NOT implement custom scroll restoration in App.jsx or individual components
 * 3. Mobile viewport changes require special handling
 * 4. Multiple scroll restoration mechanisms will conflict and cause issues
 * 
 * Implementation Notes:
 * - Uses sessionStorage for persistence
 * - Makes multiple restoration attempts to handle dynamic content
 * - Properly handles mobile viewport changes
 * - Debounces scroll position saving for performance
 * 
 * Usage:
 * Simply import and use this hook in any page component:
 * 
 * const MyPage = () => {
 *   useScrollRestoration();
 *   // ... rest of component
 * }
 * 
 * WARNING: Do not modify this hook without thorough testing on mobile devices.
 * Breaking changes to scroll restoration can significantly impact user experience.
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const useScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    let scrollTimeout;
    let isRestoring = false;
    let lastScrollY = 0;

    // Save scroll position
    const saveScrollPosition = () => {
      if (!isRestoring) {
        const scrollY = window.scrollY;
        // Only save if we've scrolled more than 50px from last saved position
        if (Math.abs(scrollY - lastScrollY) > 50) {
          lastScrollY = scrollY;
          sessionStorage.setItem(`scroll-${location.pathname}`, scrollY);
        }
      }
    };

    // Restore scroll position
    const restoreScrollPosition = () => {
      // Only restore scroll position if this is a back navigation
      if (navigationType === 'POP') {
        isRestoring = true;
        const savedScroll = sessionStorage.getItem(`scroll-${location.pathname}`);
        
        if (savedScroll) {
          const scrollY = parseInt(savedScroll);
          
          // First attempt: immediate
          window.scrollTo(0, scrollY);
          
          // Second attempt: after a short delay
          setTimeout(() => {
            if (window.scrollY !== scrollY) {
              window.scrollTo(0, scrollY);
            }
          }, 100);
          
          // Third attempt: after content loads
          setTimeout(() => {
            if (window.scrollY !== scrollY) {
              window.scrollTo(0, scrollY);
            }
            isRestoring = false;
          }, 300);
        } else {
          isRestoring = false;
        }
      } else {
        // For new navigation, scroll to top
        window.scrollTo(0, 0);
      }
    };

    // Debounced scroll handler
    const handleScroll = () => {
      if (!isRestoring) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(saveScrollPosition, 100);
      }
    };

    // Handle navigation
    const handlePopState = () => {
      restoreScrollPosition();
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handlePopState);

    // Initial restore or scroll to top
    if (isInitialMount.current) {
      isInitialMount.current = false;
      window.scrollTo(0, 0);
    } else {
      restoreScrollPosition();
    }

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(scrollTimeout);
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, [location.pathname, navigationType]);
};

export default useScrollRestoration; 