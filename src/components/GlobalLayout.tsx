
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const GlobalLayout = () => {
  return (
    <div className="min-h-screen bg-site-pattern bg-cover bg-center bg-fixed">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default GlobalLayout;
