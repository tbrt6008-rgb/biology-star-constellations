/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cosmic Mystic Core Colors
        "background": "#0a0814",                  // Deep cosmic purple-navy black
        "surface": "#17132a",                     // Nebula card base
        "surface-bright": "#252042",              // Highlighted surface
        "surface-container": "#1a1633",           // Card containers
        "surface-container-high": "#231f45",      // High contrast panel
        "surface-container-low": "#0f0c20",       // Low contrast base
        "surface-container-highest": "#2f2857",   // Highlight/active panel
        "surface-container-lowest": "#07050f",    // Absolute dark depth
        
        "primary": "#ffd13b",                     // Stellar Gold (Primary Accent)
        "on-primary": "#0a0814",                  // Deep dark text on gold
        "primary-container": "#ffd13b",
        "primary-fixed": "#ffe16d",
        "primary-fixed-dim": "#ffd13b",
        
        "secondary": "#6c4e97",                   // Nebula Purple
        "on-secondary": "#ffffff",
        "secondary-container": "#251b47",
        "secondary-fixed": "#dcb8ff",
        "secondary-fixed-dim": "#dcb8ff",
        
        "tertiary": "#ffcc33",
        "on-tertiary": "#0a0814",
        "tertiary-container": "#ffcc33",
        
        "on-surface": "#b4add0",                  // Stardust Lilac Gray (easy on eyes)
        "on-background": "#ffffff",               // Stellar White
        "on-surface-variant": "#857da3",          // Muted lavender-gray
        
        "error": "#ffb4ab",
        "on-error": "#690005",
        
        // Keep existing ones mapped for backward compatibility or override
        "on-primary-container": "#0a0814",
        "on-primary-fixed-variant": "#544600",
        "inverse-primary": "#e9b200",
        "surface-variant": "#17132a",
        "outline": "#4e466f",                     // Outline in subtle purple-gray
        "outline-variant": "#322b51"
      },
      borderRadius: {
        "DEFAULT": "12px",                        // Modern rounded cards
        "lg": "16px",
        "xl": "24px",
        "full": "9999px"
      },
      fontFamily: {
        "mono-data": ["Geist", "monospace"],
        "body-md": ["Inter", "sans-serif"],
        "headline-md": ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        "gold-glow": "0 0 25px rgba(255, 209, 59, 0.35)",
        "purple-glow": "0 0 30px rgba(108, 78, 151, 0.2)",
      }
    },
  },
  plugins: [],
}
