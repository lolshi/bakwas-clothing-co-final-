
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const GlobalLayout = () => {
  const location = useLocation();
  
  // Map routes to background themes
  const getBackgroundClass = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return 'bg-home';
    } else if (path === '/shop') {
      return 'bg-shop';
    } else if (path.startsWith('/admin')) {
      return 'bg-gray-50'; // Keep admin pages light
    } else {
      return 'bg-general';
    }
  };

  const backgroundClass = getBackgroundClass();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen ${backgroundClass} ${!isAdmin ? 'bg-cover bg-center bg-fixed' : ''}`}>
      {/* Backdrop overlay for better text readability on public pages */}
      {!isAdmin && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[0.5px] pointer-events-none" />
      )}
      
      <div className="relative z-10">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default GlobalLayout;
