// Utility functions for navigation and page tracking

// Pages that should not be considered as "last visited" for redirects
const EXCLUDED_PAGES = ['/login', '/register'];

// Store the last visited page
export const setLastVisitedPage = (pathname) => {
  if (!EXCLUDED_PAGES.includes(pathname)) {
    localStorage.setItem('lastVisitedPage', pathname);
  }
};

// Get the last visited page, fallback to home if none or excluded
export const getLastVisitedPage = () => {
  const lastPage = localStorage.getItem('lastVisitedPage');
  if (lastPage && !EXCLUDED_PAGES.includes(lastPage)) {
    return lastPage;
  }
  return '/'; // Default to home page
};

// Clear the last visited page (useful after successful redirect)
export const clearLastVisitedPage = () => {
  localStorage.removeItem('lastVisitedPage');
};

// Smart redirect based on user role and last page
export const getSmartRedirectPath = (userRole, lastPage = null) => {
  // If user is organizer, prioritize dashboard
  if (userRole === 'organizer') {
    return '/admin/dashboard';
  }
  
  // For students, use last page or home
  return lastPage || '/';
}; 