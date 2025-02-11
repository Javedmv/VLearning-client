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
    <div ref={carouselRef} className="relative w-full h-[400px] overflow-hidden">
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banner.map((slide) => (
          <div key={slide?._id} className="w-full h-full flex-shrink-0 relative">
            {/* Image */}
            <img
              src={slide?.imageUrl as string}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center px-16">
              <h2 className="text-white text-4xl font-bold mb-4">
                {slide?.title}
              </h2>
              <p className="text-white text-xl">{slide?.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {navigationType === 'dots' ? (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banner.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4">
          <button
            onClick={handlePrevSlide}
            className="bg-black bg-opacity-20 hover:bg-opacity-60 text-white p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextSlide}
            className="bg-black bg-opacity-20 hover:bg-opacity-60 text-white p-2 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Carousel;
