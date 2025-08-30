export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export const themes: Theme[] = [
  {
    name: "Classic",
    colors: {
      primary: "#2563eb",
      secondary: "#7c3aed",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e293b",
      textSecondary: "#64748b",
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6"
    },
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif"
    }
  },
  {
    name: "Dark",
    colors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#fbbf24",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#94a3b8",
      success: "#22c55e",
      error: "#f87171",
      warning: "#fbbf24",
      info: "#60a5fa"
    },
    fonts: {
      heading: "'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif"
    }
  },
  {
    name: "Warm",
    colors: {
      primary: "#dc2626",
      secondary: "#ea580c",
      accent: "#fbbf24",
      background: "#fef7ed",
      surface: "#fff7ed",
      text: "#451a03",
      textSecondary: "#92400e",
      success: "#16a34a",
      error: "#dc2626",
      warning: "#ea580c",
      info: "#2563eb"
    },
    fonts: {
      heading: "'Georgia', serif",
      body: "'Georgia', serif"
    }
  },
  {
    name: "Ocean",
    colors: {
      primary: "#0891b2",
      secondary: "#0e7490",
      accent: "#06b6d4",
      background: "#f0f9ff",
      surface: "#e0f2fe",
      text: "#0c4a6e",
      textSecondary: "#0369a1",
      success: "#059669",
      error: "#dc2626",
      warning: "#d97706",
      info: "#0891b2"
    },
    fonts: {
      heading: "'Segoe UI', system-ui, sans-serif",
      body: "'Segoe UI', system-ui, sans-serif"
    }
  },
  {
    name: "Neon",
    colors: {
      primary: "#00ff00",
      secondary: "#ff00ff",
      accent: "#00ffff",
      background: "#000000",
      surface: "#111111",
      text: "#ffffff",
      textSecondary: "#cccccc",
      success: "#00ff00",
      error: "#ff0000",
      warning: "#ffff00",
      info: "#0080ff"
    },
    fonts: {
      heading: "'Courier New', monospace",
      body: "'Courier New', monospace"
    }
  }
];

export const defaultTheme = themes[0];

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--font-${key}`, value);
  });
}
