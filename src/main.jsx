import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/css/bundle";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App";
import { AppWrapper } from "./components/common/PageMeta";
import { ThemeProvider } from "./context/ThemeContext";
import { FontProvider } from "./context/FontContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <FontProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </FontProvider>
    </ThemeProvider>
  </StrictMode>,
);
