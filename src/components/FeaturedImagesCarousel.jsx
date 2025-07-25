import React, { useEffect, useState, useRef } from 'react';
import { getFeaturedImages } from '../api/featuredImages';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Button } from './ui/button';

function FeaturedImagesCarousel() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getFeaturedImages().then((imgs) => {
      setImages(imgs);
      setLoading(false);
    });
  }, []);

  const slidesToShow = Math.min(3, images.length || 1);
  const sliderSettings = {
    dots: true,
    infinite: images.length > slidesToShow,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, images.length || 1),
          infinite: images.length > 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          infinite: images.length > 1,
        },
      },
    ],
    appendDots: dots => (
      <div className="flex flex-col items-center mt-4">
        <div className="flex gap-2 justify-center">{dots}</div>
      </div>
    ),
    customPaging: i => (
      <button
        className="h-3 w-3 rounded-full bg-gray-300 slick-dot"
        aria-label={`Go to slide ${i + 1}`}
      />
    ),
  };

  if (loading) return <div className="w-full flex justify-center py-10"><span>Loading...</span></div>;
  if (!images.length) return null;

  return (
    <div className="w-full bg-white">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-left border-b border-amber-600"><span className='text-amber-600'>Featured </span>events</h2>
          <div className='flex gap-2'>
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              aria-label="Previous"
              type="button"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="p-2 rounded-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
              aria-label="Next"
              type="button"
            >
              <ChevronRight size={22} />
            </button>
          </div>
      </div>
      <div className="relative">
        <Slider ref={sliderRef} {...sliderSettings}>
          {images.map((img) => (
            <div key={img._id} className="px-2">
              <div className="flex flex-col items-center bg-gray-50 rounded-sm h-60 flex-shrink-0 w-full overflow-hidden">
                <img src={img.url} alt={img.title || 'Featured'} className="object-cover w-full h-full" />
                <div className="w-full border-t-none border-1 border-gray-300 text-white flex justify-between items-center px-4 py-2 rounded-b-sm">
                  <span className="truncate text-black font-semibold">{img.eventName}</span>
                  <a href={img.eventUrl} target="_blank" rel="noopener noreferrer" className='flex items-center gap-2'>
                    <Button variant="outline" className="text-black" size="sm">Visit <ArrowUpRight size={16} /></Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default FeaturedImagesCarousel; 