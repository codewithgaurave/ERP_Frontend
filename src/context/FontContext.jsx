import React, { createContext, useContext, useState, useEffect } from "react";

const FontContext = createContext();

export const FONTS = [
  { id: "outfit", name: "Outfit (Default)", provider: "Google Fonts" },
  { id: "inter", name: "Inter", provider: "Google Fonts" },
  { id: "roboto", name: "Roboto", provider: "Google Fonts" },
  { id: "poppins", name: "Poppins", provider: "Google Fonts" },
  { id: "baskerville", name: "Libre Baskerville", provider: "Google Fonts" },
  { id: "playfair", name: "Playfair Display", provider: "Google Fonts" },
  { id: "lexend", name: "Lexend", provider: "Google Fonts" },
  { id: "space-grotesk", name: "Space Grotesk", provider: "Google Fonts" },
];

export const FontProvider = ({ children }) => {
  const [font, setFont] = useState(() => {
    return localStorage.getItem("app-font") || "outfit";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-font", font);
    localStorage.setItem("app-font", font);
  }, [font]);

  return (
    <FontContext.Provider value={{ font, setFont, FONTS }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};
