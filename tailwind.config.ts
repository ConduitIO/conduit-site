import type { Config } from 'tailwindcss'
import colors from "tailwindcss/colors";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      colors: {
        // Tailwind Colors
        gray: colors.gray,
        teal: colors.teal,
        red: colors.red,
        yellow: colors.yellow,
        cyan: colors.cyan,
        purple: colors.purple,
        // Custom Meroxa colors
        slate: {
          5: '#F5F5F5',
          20: '#D6D7D9',
          40: '#A5A7AB',
          60: '#85878D',
          100: '#111827',
          'dark': '#282D39'
        },

        forest: {
          5: '#F2F7F7',
          20: '#CEDFE2',
          40: '#B6CBCE',
          60: '#6C9EA7',
          100: '#134E4A'
        },

        sky: {
          5: '#F4FBFD',
          20: '#D2F2F7',
          40: '#BCECF4',
          60: '#79D8E8',
          100: '#06B6D4'
        },

        canary: {
          5: '#FEFCF5',
          20: '#FCF3D8',
          40: '#FAEEC5',
          60: '#F5DC8B',
          100: '#FBBF24'
        },

        saffron: {
          5: '#FDF6F5',
          20: '#F8DED8',
          40: '#F5CDC5',
          60: '#EB9B8B',
          100: '#DC2626'
        },

        plum: {
          5: '#FAF5FD',
          20: '#EBD8F8',
          40: '#E1C5F4',
          60: '#C48AE9',
          100: '#9333EA'
        },

        frost: {
          20: '#FBFBFB',
          40: '#F0F1F5',
          60: '#E9EBEF',
          100: '#6B7280'
        },

        verdant: {
          100: '#0F766E'
        },

        white: '#FFFFFF',
        black: '#000000',
        transparent: 'transparent'
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  safelist: [
    // include classes used in footer
    'text-black',
    'text-gray-600',
    'flex',
    'mt-6',
    'ml-4',
  ],
};

export default config;
