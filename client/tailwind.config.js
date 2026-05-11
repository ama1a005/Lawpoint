/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0A1931', mid: '#1A3D63' },
        steel: { DEFAULT: '#4A7FA7' },
        sky: { DEFAULT: '#B3CFE5' },
        ice: { DEFAULT: '#F6FAFD' },
        slate: { DEFAULT: '#64748B' },
      },
      fontFamily: { sans: ['Manrope', 'sans-serif'] },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '500' }],
      },
      borderRadius: { sm: '4px', md: '8px', lg: '16px', full: '9999px' },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px -1px rgba(10,25,49,0.10)',
        lg: '0 10px 15px -3px rgba(10,25,49,0.10)',
      },
      maxWidth: { container: '1280px' },
    },
  },
  plugins: [],
};