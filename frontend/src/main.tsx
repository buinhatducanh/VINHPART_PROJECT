import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from '@/shared/lib/i18n';
import App from "./App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </HelmetProvider>
);
