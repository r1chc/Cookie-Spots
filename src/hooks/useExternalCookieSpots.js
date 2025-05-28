import { useState, useEffect } from 'react';
import { cookieSpotApi } from '../utils/api';

export const useExternalCookieSpots = (searchQuery, searchLocation, enabled = true) => {
  const [externalResults, setExternalResults] = useState([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [externalError, setExternalError] = useState(null);
  const [searchViewport, setSearchViewport] = useState(null);

  useEffect(() => {
    if (!enabled || !searchQuery) {
        setExternalResults([]); // Clear results if not enabled or no query
        setIsLoadingExternal(false);
        setExternalError(null);
        setSearchViewport(null);
        return;
    }

    const loadExternal = async () => {
      setIsLoadingExternal(true);
      setExternalError(null);
      setSearchViewport(null);
      
      try {
        console.log('Fetching from external sources...', { searchQuery, searchLocation });
        const response = await cookieSpotApi.searchExternalSources(searchQuery || searchLocation);
        console.log('External Service Response:', response.data);
        
        if (response.data && response.data.results) {
          const resultsWithSource = response.data.results.map(spot => ({ ...spot, source: 'external' }));
          setExternalResults(resultsWithSource);
          setSearchViewport(response.data.viewport || null);
          console.log(`Received ${resultsWithSource.length} external spots.`);
        } else {
          console.warn('No spots found in external source response or unexpected data format.', response.data);
          setExternalResults([]);
        }
      } catch (error) {
        console.error('Error fetching from external sources hook:', error);
        setExternalError(error);
        setExternalResults([]); // Clear results on error
      } finally {
        setIsLoadingExternal(false);
      }
    };

    loadExternal();

  }, [searchQuery, searchLocation, enabled]); // Dependency array ensures this runs when query/location changes

  return { externalResults, isLoadingExternal, externalError, searchViewport };
}; 