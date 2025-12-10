/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arctic: {
          50: '#f0f6fc',
          100: '#c9d1d9',
          200: '#b1bac4',
          300: '#8b949e',
          400: '#6e7681',
          500: '#58a6ff',
          600: '#1f6feb',
          700: '#0969da',
          800: '#0550ae',
          900: '#033d8b',
          950: '#0a3069'
        },
        ice: {
          50: '#f6f8fa',
          100: '#eaeef2',
          200: '#d0d7de',
          300: '#afb8c1',
          400: '#8c959f',
          500: '#6e7781',
          600: '#57606a',
          700: '#424a53',
          800: '#32383f',
          900: '#24292f',
          950: '#1c2128'
        },
        polar: {
          50: '#ecfeff',
          100: '#d3f9ff',
          200: '#a5f3fc',
          300: '#79c0ff',
          400: '#58a6ff',
          500: '#1f6feb',
          600: '#0969da',
          700: '#0550ae',
          800: '#033d8b',
          900: '#0a3069',
          950: '#0c2d6b'
        },
        telescope: {
          bg: '#0d1117',
          surface: '#161b22',
          elevated: '#21262d',
          border: '#30363d',
          text: '#c9d1d9',
          'text-secondary': '#8b949e',
          'text-tertiary': '#6e7681',
          blue: '#58a6ff',
          green: '#3fb950',
          yellow: '#d29922',
          red: '#f85149'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif']
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'gradient': 'gradient 3s ease infinite',
        'fall-slow': 'fall 4s ease-in-out infinite',
        'fall-medium': 'fall 3s ease-in-out infinite 0.5s',
        'fall-fast': 'fall 2.5s ease-in-out infinite 1s',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        fall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { transform: 'translateY(50px) rotate(360deg)', opacity: 0 }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      backgroundImage: {
        'arctic-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'ice-gradient': 'linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 100%)',
        'polar-gradient': 'radial-gradient(circle at top, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)'
      },
      screens: {
        'xs': '475px',
        // => @media (min-width: 475px) { ... }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      }
    },
  },
  plugins: [],
}