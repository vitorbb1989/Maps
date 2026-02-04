/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',

        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--surface-muted) / <alpha-value>)',
        'surface-hover': 'rgb(var(--surface-hover))',

        text: 'rgb(var(--text) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',

        border: 'rgb(var(--border))',
        'border-hover': 'rgb(var(--border-hover))',
        'border-focus': 'rgb(var(--border-focus))',

        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
          active: 'rgb(var(--primary-active) / <alpha-value>)',
          bg: 'rgb(var(--primary-bg))',
          border: 'rgb(var(--primary-border))',
          foreground: 'rgb(var(--on-primary) / <alpha-value>)',
        },

        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          bg: 'rgb(var(--success-bg))',
          border: 'rgb(var(--success-border))',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          bg: 'rgb(var(--warning-bg))',
          border: 'rgb(var(--warning-border))',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          bg: 'rgb(var(--danger-bg))',
          border: 'rgb(var(--danger-border))',
        },
        info: {
          DEFAULT: 'rgb(var(--info) / <alpha-value>)',
          bg: 'rgb(var(--info-bg))',
          border: 'rgb(var(--info-border))',
        },
        ai: {
          DEFAULT: 'rgb(var(--ai) / <alpha-value>)',
          bg: 'rgb(var(--ai-bg))',
          border: 'rgb(var(--ai-border))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
      }
    },
  },
  plugins: [],
}
