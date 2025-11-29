import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ea5e9',
          hover: '#0284c7',
          light: '#e0f2fe',
          lighter: '#f0f9ff',
          dark: '#0369a1',
        },
        success: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#d1fae5',
          lighter: '#ecfdf5',
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
          light: '#fee2e2',
          lighter: '#fef2f2',
        },
        warning: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
          light: '#fef3c7',
          lighter: '#fffbeb',
        },
        info: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#e0e7ff',
          lighter: '#eef2ff',
        },
        text: {
          primary: '#111827',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
          inverse: '#ffffff',
          disabled: '#d1d5db',
        },
        bg: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
          hover: '#f9fafb',
          active: '#f3f4f6',
        },
        border: {
          DEFAULT: '#e5e7eb',
          hover: '#d1d5db',
          focus: '#0ea5e9',
          error: '#ef4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
      },
    },
  },
  plugins: [],
}

export default config

