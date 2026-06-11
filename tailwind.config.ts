/**
 * tailwind.config.ts
 *
 * Tailwind CSS configuration for the app
 * Extends the default theme with custom colors animations and fonts
 * The content array tells Tailwind which files to scan for class names
 * so unused styles get purged from the production build automatically
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  // scan all page and component files for Tailwind class names
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.css',
  ],

  // dark mode is toggled by adding the dark class to the html element
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // brand purple used for buttons active states and highlights
        brand: {
          DEFAULT: '#7c6af7',
          hover: '#9585f8',   // slightly lighter for hover states
          muted: '#4a3fa0',   // darker for subtle backgrounds
        },
        // surface colors reference CSS variables so light mode overrides take effect
        surface: {
          base: 'var(--color-surface-base)',
          raised: 'var(--color-surface-raised)',
          border: 'var(--color-surface-border)',
        },
      },

      // Inter is loaded from Google Fonts in globals.css
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // custom keyframe animations used throughout the app
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },   // slides up slightly while fading in
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },  // used for the task detail drawer
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },  // used for modals
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // shorthand animation classes that apply the keyframes above
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-up': 'slide-in-up 0.2s ease-out',
      },
    },
  },

  plugins: [],
};

export default config;