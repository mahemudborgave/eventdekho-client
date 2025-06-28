import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setLastVisitedPage } from '../utils/navigationUtils';

// Custom hook to track page visits
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track the current page
    setLastVisitedPage(location.pathname);
  }, [location.pathname]);
}; 