import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AdoptPage from './pages/AdoptPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HomePage from './pages/HomePage.jsx';
import JoinPage from './pages/JoinPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PetsPage from './pages/PetsPage.jsx';
import ReleasePage from './pages/ReleasePage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import CreditsPage from './pages/CreditsPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import GetInvolvedPage from './pages/GetInvolvedPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MemberPage from './pages/MemberPage.jsx';

const routeTitles = {
  '/': 'Home',
  '/about': 'About us',
  '/pets': 'Adopt a pet',
  '/join': 'Join us',
  '/login': 'Log in',
  '/forgot-password': 'Reset password',
  '/member': 'My membership',
  '/get-involved': 'Get involved',
  '/adopt': 'Adoption enquiry',
  '/release': 'Rehome a pet',
  '/contact': 'Contact',
  '/privacy': 'Privacy',
  '/terms': 'Terms',
  '/credits': 'Image credits',
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
    <AuthProvider>
      <RouteDocumentTitle />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetsPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/get-involved" element={<GetInvolvedPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/member" element={<MemberPage />} />
            <Route path="/adopt" element={<AdoptPage />} />
          </Route>
          <Route path="/release" element={<ReleasePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
