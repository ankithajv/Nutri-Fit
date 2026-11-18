/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Colour tokens ─────────────────────────────────────────────────
      colors: {
        // Backgrounds & surfaces
        cream:    { 100: '#F7EEE3', 200: '#F1E4D3' },
        card:     { DEFAULT: '#FFFFFF', soft: '#FBF5EC' },
        line:     '#E8D9C5',

        // Brand
        olive:    { 100: '#EEEBC0', 500: '#B8B240', 700: '#7A781F' },
        orange:   { 100: '#FFE3CC', 500: '#FF7A1A' },
        dark:     { 800: '#44432B', 900: '#33321E' },
        lavender: { 200: '#D9C2F2' },

        // Text
        ink:    { DEFAULT: '#2A2815', 2: '#6B6755', 3: '#9A9582' },
        'on-dark':  '#F7EEE3',
        'on-dark-2': '#C9C4A5',

        // Status
        good:    { DEFAULT: '#7A781F', bg: '#EEEBC0' },
        caution: { DEFAULT: '#B86E00', bg: '#FFEBC2' },
        alert:   { DEFAULT: '#C2412E', bg: '#FBE1DB' },

        // ── Legacy aliases (backward compat) ───────────────────────────
        bg:              '#F7EEE3',
        surface:         '#FFFFFF',
        'surface-soft':  '#FBF5EC',
        border:          '#E8D9C5',
        text:            '#2A2815',
        'text-2':        '#6B6755',
        'text-3':        '#9A9582',
        accent:          '#7A781F',
        'accent-light':  '#EEEBC0',
        'accent-dark':   '#7A781F',
        'chart-protein': '#B8B240',
        'chart-carbs':   '#FF7A1A',
        'chart-fat':     '#D9C2F2',
        'chart-empty':   '#E8D9C5',
        'ai-tint':       '#33321E',
        'ai-border':     '#44432B',

        // ── Status legacy aliases ───────────────────────────────────────
        'good-bg':    '#EEEBC0',
        'caution-bg': '#FFEBC2',
        'alert-bg':   '#FBE1DB',
      },

      // ── Typography ───────────────────────────────────────────────────
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['Lora', 'Georgia', 'serif'],
        feature: ['Outfit', 'system-ui', 'sans-serif'],
        script:  ['"Dancing Script"', 'cursive'],
      },

      // ── Radius ───────────────────────────────────────────────────────
      borderRadius: {
        card:  '28px',
        inner: '20px',
        chip:  '999px',
        // legacy
        input:  '20px',
        button: '999px',
        sm:     '8px',
        md:     '20px',
        lg:     '28px',
      },

      // ── Shadows ──────────────────────────────────────────────────────
      boxShadow: {
        card:     '0 4px 16px rgba(51, 50, 30, 0.08)',
        'card-hover': '0 8px 24px rgba(51, 50, 30, 0.14)',
        subtle:   '0 4px 16px rgba(51, 50, 30, 0.08)',
        'ai-glow':'0 4px 24px rgba(51, 50, 30, 0.24)',
      },

      // ── Spacing extras ───────────────────────────────────────────────
      maxWidth: {
        content: '1280px',
      },

      // ── Transitions ──────────────────────────────────────────────────
      transitionTimingFunction: {
        natural: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        micro:    '120ms',
        standard: '200ms',
        emphasis: '400ms',
      },

      // ── Keyframes & animations ───────────────────────────────────────
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        barGrow: {
          from: { transform: 'scaleY(0)' },
          to:   { transform: 'scaleY(1)' },
        },
        todayPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.7' },
        },
        badgePop: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '70%':  { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':     'fadeIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 1.4s linear infinite',
        'bar-grow':    'barGrow 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'today-pulse': 'todayPulse 1.2s ease-in-out 1',
        'badge-pop':   'badgePop 400ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'count-up':    'countUp 400ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
    },
  },
  plugins: [],
};
