import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  colors: {
    background: string;
    surface: string;
    primaryText: string;
    subText: string;
    alertBarBg: string;
    alertBarText: string;
  };
  brandPrimaryBg: string;
  setBrandPrimaryBg: (color: string) => void;
  getNavTextColor: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local Storage Keys
const THEME_STORAGE_KEY = "System_Theme_State";
const BRAND_PRIMARY_BG_STORAGE_KEY = "Brand_Primary_BG";

// Helper function to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance using the sRGB color space formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is less than 0.5, it's a dark color
  return luminance < 0.5;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or default to "dark"
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        return (savedTheme === "light" || savedTheme === "dark") ? savedTheme : "dark";
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
    return "dark";
  });

  // Initialize brandPrimaryBg from localStorage or default to Midnight Blue
  const [brandPrimaryBg, setBrandPrimaryBgState] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedBrandBg = localStorage.getItem(BRAND_PRIMARY_BG_STORAGE_KEY);
        return savedBrandBg || "#2C3E50";
      }
    } catch (error) {
      console.warn('Failed to read brand color from localStorage:', error);
    }
    return "#2C3E50";
  });

  const getColors = (currentTheme: Theme) => {
    if (currentTheme === "dark") {
      return {
        background: "#0F172A", // Midnight Blue
        surface: "#1E293B", // Slate Blue
        primaryText: "#F8FAFC", // Off-white
        subText: "#94A3B8", // Grey
        alertBarBg: "#FFFFFF", // White bar in dark mode
        alertBarText: "#0F172A", // Dark text in dark mode
      };
    } else {
      return {
        background: "#F8FAFC", // Cool White
        surface: "#FFFFFF", // Pure White
        primaryText: "#0F172A", // Midnight Blue
        subText: "#64748B", // Slate Grey
        alertBarBg: "#0F172A", // Midnight Blue bar in light mode (INVERTED)
        alertBarText: "#FFFFFF", // White text in light mode (INVERTED)
      };
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        }
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  const setBrandPrimaryBg = (color: string) => {
    setBrandPrimaryBgState(color);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(BRAND_PRIMARY_BG_STORAGE_KEY, color);
      }
    } catch (error) {
      console.warn('Failed to save brand color to localStorage:', error);
    }
  };

  const colors = getColors(theme);

  const getNavTextColor = () => {
    return isColorDark(brandPrimaryBg) ? "#F8FAFC" : "#0F172A";
  };

  // Update CSS custom properties when theme or brand color changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-background", colors.background);
    root.style.setProperty("--theme-surface", colors.surface);
    root.style.setProperty("--theme-primary-text", colors.primaryText);
    root.style.setProperty("--theme-sub-text", colors.subText);
    root.style.setProperty("--theme-alert-bar-bg", colors.alertBarBg);
    root.style.setProperty("--theme-alert-bar-text", colors.alertBarText);
    root.style.setProperty("--brand-primary-bg", brandPrimaryBg);
    root.style.setProperty("--nav-text-color", getNavTextColor());
  }, [theme, colors, brandPrimaryBg]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colors, brandPrimaryBg, setBrandPrimaryBg, getNavTextColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}