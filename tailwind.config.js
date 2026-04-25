/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
        bg:   '#EDEDE9',
        bg2:  '#F5F4F0',
        ink:  '#0E0E0C',
        mute: '#6B6A66',
        line: '#D9D7D0',
        accent: '#C9553B',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif:   ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        body: [
          'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'
        ],
        sans: [
          'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%':     { transform: 'translate(20px,-30px) scale(1.08)' }
        },
        slide: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' }
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to:   { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        float:   'float 14s ease-in-out infinite',
        slide:   'slide 30s linear infinite',
        fadeIn:  'fadeIn .3s ease-out both'
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};
