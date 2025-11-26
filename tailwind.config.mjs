/**
 * Tailwind configuration: expose color palette as utility classes
 * Adds: bg-dark-blue, text-sky-blue, bg-sun-yellow, text-earth, border-brick-red, etc.
 */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#92B6B7',
        'sky-blue': '#2AC6EA',
        'sun-yellow': '#F7B86E',
        'earth': '#F2EEEB',
        'brick-red': '#ED6673'
      }
    }
  },
  plugins: []
};
