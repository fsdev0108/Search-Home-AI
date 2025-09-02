import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  {
    src: '/images/hero-luxury.jpg',
    alt: 'Luxury real estate',
    name: 'Luxury'
  },
  {
    src: '/images/hero-modern.jpg',
    alt: 'Modern real estate',
    name: 'Modern'
  },
  {
    src: '/images/hero-house.jpg',
    alt: 'Beautiful house',
    name: 'Classic'
  }
];

export default function HeroBackground({ children }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Images with Fade Transition */}
      {heroImages.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
            quality={90}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
      ))}

      {/* Image Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Switch to ${heroImages[index].name} view`}
          />
        ))}
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 w-full">
        {children}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float z-10">
        <div className="w-4 h-4 bg-primary/40 rounded-full"></div>
      </div>
      <div className="absolute top-40 right-20 animate-float z-10" style={{ animationDelay: '1s' }}>
        <div className="w-3 h-3 bg-accent/40 rounded-full"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float z-10" style={{ animationDelay: '2s' }}>
        <div className="w-5 h-5 bg-success/40 rounded-full"></div>
      </div>
    </div>
  );
}
