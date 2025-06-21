import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[9999] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-2xl hover:scale-110"
          aria-label="Scroll to top"
          style={{ 
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop; 