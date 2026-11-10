import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pets.css';
import './styles/home-about.css';
import './styles/forms.css';
import './styles/polish.css';
import './styles/images.css';
import './styles/get-involved.css';
import './styles/member.css';
import './styles/admin.css';

// Mount the single-page application and make browser history available to its routes.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
