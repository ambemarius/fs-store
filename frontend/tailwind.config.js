/** @type {import('tailwindcss').Config} */
export default {
  // Files Tailwind scans to decide which utility classes to generate.
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    // Layout-level design tokens for the shoe catalog.
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb', // primary blue (buttons, prices)
          dark: '#1e293b',    // slate header
          accent: '#16a34a',  // WhatsApp green
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        catalog: '64rem', // max width of the main catalog workspace
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
}
