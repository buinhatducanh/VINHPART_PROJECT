import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { I18nProvider } from '@/shared/lib/i18n';
import App from "./App.tsx";
import "./styles/index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </GoogleOAuthProvider>
  </HelmetProvider>
);
