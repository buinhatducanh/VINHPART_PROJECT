import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { I18nProvider } from '@/shared/lib/i18n';
import App from "./App.tsx";
import "./styles/index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// GoogleOAuthProvider must always wrap the app — useGoogleLogin() in AuthModal
// requires the context regardless of whether clientId is configured.
createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <HelmetProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </HelmetProvider>
  </GoogleOAuthProvider>
);
