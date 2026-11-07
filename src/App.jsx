import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AdoptPage from './pages/AdoptPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HomePage from './pages/HomePage.jsx';
import JoinPage from './pages/JoinPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PetsPage from './pages/PetsPage.jsx';
import ReleasePage from './pages/ReleasePage.jsx';

const routeTitles = {
  '/': 'Home',
  '/about': 'About us',
  '/pets': 'Adopt a pet',
  '/join': 'Join us',
  '/adopt': 'Adoption enquiry',
  '/release': 'Rehome a pet',
  '/contact': 'Contact',
};

// Keep the browser tab title in step with the page currently shown.
function RouteDocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isPetDetail = pathname.startsWith('/pets/');
    const pageTitle = isPetDetail ? 'Pet details' : routeTitles[pathname] ?? 'Page not found';
    document.title = `${pageTitle} | Pet Heaven`;
  }, [pathname]);

  return null;
}

// Define the app's page routes inside one shared header, main area, and footer.
export default function App() {
  return (
    <>
      <RouteDocumentTitle />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetsPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/adopt" element={<AdoptPage />} />
          <Route path="/release" element={<ReleasePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
