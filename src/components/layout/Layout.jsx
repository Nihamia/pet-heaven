import { Outlet } from 'react-router-dom';
import BackToTop from './BackToTop.jsx';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

// Wrap every route with the shared Pet Heaven navigation, content area, and footer.
export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="site-main" id="main-content" tabIndex="-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
