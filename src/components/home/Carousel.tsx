import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../../types/Banner';

interface CarouselProps {
  navigationType: 'dots' | 'arrows';
  banner: Banner[]
}


const Carousel: React.FC<CarouselProps> = ({ banner, navigationType }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);

  // Auto-slide functionality controlled by visibility state
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isCarouselVisible) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banner.length);
      }, 5000); // Change slide every 5 seconds
    }
    return () => clearInterval(timer);
  }, [isCarouselVisible]);

  // Visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsCarouselVisible(entry.isIntersecting);
      },
      { threshold: 0.5 } // Adjust threshold as needed
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banner.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? banner.length - 1 : prev - 1
    );
  };

  return (
    <div ref={carouselRef} className="relative w-full h-[500px] group">
      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banner.map((slide) => (
          <div 
            key={slide?._id} 
            className="w-full h-full flex-shrink-0 relative"
          >
            {/* Image with gradient overlay */}
            <div className="absolute inset-0">
              <img
                src={slide?.imageUrl as string}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end px-8 md:px-16 pb-20 text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fadeIn">
                {slide?.description}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {navigationType === 'dots' ? (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {banner.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button
            onClick={handlePrevSlide}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                     bg-black/30 hover:bg-black/50 text-white p-3 rounded-full 
                     transform hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextSlide}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                     bg-black/30 hover:bg-black/50 text-white p-3 rounded-full 
                     transform hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Carousel;
