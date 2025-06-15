import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WhyBakwas = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Parallax effect for background
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        sectionRef.current.style.setProperty('--parallax-x', `${rate}px`);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const uspCards = [
    {
      icon: '/assets/icons/trippy-palette.svg',
      title: 'Trippy Meets Street',
      copy: 'Designs that vibe loud & glow harder.'
    },
    {
      icon: '/assets/icons/oversize-shirt.svg',
      title: 'Oversized, Not Overhyped',
      copy: 'Premium cuts that flow with your every move.'
    },
    {
      icon: '/assets/icons/limited-drop.svg',
      title: 'No Mass Dropouts',
      copy: 'Limited runs. No restocks—ever.'
    },
    {
      icon: '/assets/icons/fabric-roll.svg',
      title: 'Quality Cloth',
      copy: '100% ring-spun cotton for next-level comfort & durability.'
    },
    {
      icon: '/assets/icons/print-press.svg',
      title: 'Print Perfection',
      copy: 'Ultra-sharp, eco-ink prints that won\'t fade or crack.'
    },
    {
      icon: '/assets/icons/easy-return.svg',
      title: 'Hassle-Free Returns',
      copy: 'Easy exchanges or full refunds within 30 days—no questions asked.'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="why-bakwas" 
      className="relative min-h-screen overflow-hidden py-16 px-6 md:px-24"
      style={{
        background: 'transparent',
        ['--parallax-x' as any]: '0px'
      }}
    >
      {/* Graffiti Texture with Parallax */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          transform: `translateX(var(--parallax-x))`,
          willChange: 'transform'
        }}
      />

      {/* Floating Neon Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: '0 0 6px currentColor'
            }}
          />
        ))}
      </div>

      {/* 3D Background Mesh */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          transform: 'perspective(1000px) rotateX(10deg) rotateY(5deg)',
          transformStyle: 'preserve-3d',
          animation: 'meshRotate 15s ease-in-out infinite',
          willChange: 'transform'
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 3D Extruded Header */}
        <div className="text-center mb-16">
          <h2
            ref={headerRef}
            className={`font-anton text-4xl sm:text-4xl md:text-7xl lg:text-8xl uppercase text-white transition-all duration-700 break-words text-balance leading-tight ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'
            }`}
            style={{
              textShadow: `
                1px 1px 0 #ff0080,
                2px 2px 0 #ff0080,
                3px 3px 0 #ff0080,
                4px 4px 0 #ff0080,
                5px 5px 0 #ff0080,
                6px 6px 0 #ff0080,
                7px 7px 0 #ff0080,
                8px 8px 0 #ff0080,
                0 0 30px rgba(255,0,128,0.5)
              `,
              willChange: 'transform, opacity'
            }}
          >
            WHY CHOOSE BAKWAS?
          </h2>
        </div>

        {/* USP Card Grid */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {uspCards.map((card, index) => (
            <div
              key={index}
              className={`usp-card bg-black/60 border-2 border-transparent rounded-2xl p-6 text-center transition-all duration-500 hover:border-cyan-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
                willChange: 'transform, opacity',
                backdropFilter: 'blur(10px)'
              }}
            >
              <img 
                src={card.icon} 
                alt={card.title}
                className="usp-icon w-12 h-12 mb-4 mx-auto transition-all duration-300"
              />
              <h3 
                className="font-anton text-lg text-white mb-1"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {card.title}
              </h3>
              <p className="font-['Poppins'] text-sm text-white leading-relaxed max-w-[200px] mx-auto">
                {card.copy}
              </p>
            </div>
          ))}
        </div>

        {/* 3D CTA Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/shop')}
            className="cta-button bg-transparent border-2 border-pink-500 text-white font-anton text-base md:text-2xl uppercase px-8 py-4 md:px-12 md:py-6 rounded-3xl transition-all duration-300"
            style={{
              textShadow: `
                1px 1px 0 rgba(0,0,0,0.3),
                0 0 10px rgba(255,0,128,0.3)
              `,
              animation: 'gentlePulse 2s ease-in-out infinite',
              willChange: 'transform'
            }}
          >
            Explore Drops
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyBakwas; 