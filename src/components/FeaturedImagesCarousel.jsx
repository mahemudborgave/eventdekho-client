import React, { useEffect, useState, useRef } from 'react';
import { getFeaturedImages } from '../api/featuredImages';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function FeaturedImagesCarousel() {
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const scrollRef = useRef();
  const cardRef = useRef();

  useEffect(() => {
    getFeaturedImages().then(setImages);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Scroll to the correct position when activeIndex changes
    if (scrollRef.current && cardRef.current) {
      const cardWidth = cardRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });
    }
  }, [activeIndex, isMobile]);

  if (!images.length) return null;

  // Number of cards visible at once
  const visibleCount = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, images.length - visibleCount);

  const goToSlide = (idx) => {
    const clampedIdx = Math.max(0, Math.min(idx, maxIndex));
    setActiveIndex(clampedIdx);
  };

  const handlePrev = () => {
    if (activeIndex > 0) goToSlide(activeIndex - 1);
  };
  const handleNext = () => {
    if (activeIndex < maxIndex) goToSlide(activeIndex + 1);
  };

  return (
    <div className="w-full bg-white py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-left">Featured</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === maxIndex}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex transition-all duration-500 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            width: '100%',
            scrollSnapType: 'x mandatory',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
          }}
        >
          {images.map((img, idx) => (
            <div
              key={img._id}
              ref={idx === 0 ? cardRef : null}
              className={`flex flex-col items-center bg-gray-50 rounded-lg h-45 flex-shrink-0 p-4 ${isMobile ? 'w-full' : 'w-1/3'}`}
              style={{ scrollSnapAlign: 'start', minWidth: isMobile ? '100%' : '33.3333%' }}
            >
              <img src={img.url} alt={img.title || 'Featured'} className="object-cover w-full h-40 rounded" />
            </div>
          ))}
        </div>
      </div>
      {/* Indicators below */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex gap-2 justify-center">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-3 w-3 rounded-full ${activeIndex === idx ? 'bg-blue-600' : 'bg-gray-300'} transition`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturedImagesCarousel; 