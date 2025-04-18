import { useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing map updates
 * @param {Function} callback - The function to call after debouncing
 * @param {number} delay - Delay in milliseconds
 * @param {number} minInterval - Minimum interval between updates
 * @returns {Function} - Debounced callback function
 */
export const useMapDebounce = (callback, delay = 200, minInterval = 500) => {
  const timeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate >= minInterval) {
      callback();
      lastUpdateRef.current = now;
    } else {
      timeoutRef.current = setTimeout(() => {
        callback();
        lastUpdateRef.current = Date.now();
      }, delay);
    }
  }, [callback, delay, minInterval]);
}; 