import { useEffect } from 'react';

export default function BrandTagline() {
  useEffect(() => {
    const container = document.getElementById('brand-tagline');
    if (!container) return;

    const text = container.querySelector('.tagline-text') as HTMLDivElement;
    if (!text) return;

    // Only enable parallax on non-touch devices and screens wider than 640px
    const isTouchDevice = 'ontouchstart' in window;
    const isWideScreen = window.innerWidth > 640;

    if (!isTouchDevice && isWideScreen) {
      function onMove(e: MouseEvent) {
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
        const dy = (e.clientY - (rect.top + rect.height/2)) / rect.height;

        // Apply transforms to text and its pseudo-element (halo)
        text.style.transform = `translate(${dx*3}%, ${dy*3}%)`;
        text.style.setProperty('--halo-dx', `${dx*1}%`);
        text.style.setProperty('--halo-dy', `${dy*1}%`);
      }

      container.addEventListener('mousemove', onMove);
      return () => container.removeEventListener('mousemove', onMove);
    }
  }, []);

  return (
    <section id="brand-tagline" className="relative w-full h-72 overflow-hidden">
      <div className="tagline-text mx-auto text-center pt-12">
        <h1 className="text-6xl md:text-8xl">TRIP TESTED.</h1>
        <h1 className="text-6xl md:text-8xl">STREET CERTIFIED.</h1>
      </div>
    </section>
  );
} 