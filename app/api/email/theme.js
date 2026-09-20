import { resolveCategory } from '@/lib/categories';

/**
 * How the pitch email looks, per category.
 *
 * The demo the recipient is about to open sets the expectation, so the
 * mail that carries the link should not contradict it. Clinic mail stays
 * clinical: cool greys, system sans, soft corners. Interior mail is the
 * studio page in miniature - warm paper, near-black ink, square corners,
 * a serif face. Everything here is a plain colour or a web-safe stack,
 * because mail clients strip webfonts and drop half of CSS.
 */

const THEMES = {
  clinic: {
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    pageBg: '#f9fafb',
    cardBg: '#ffffff',
    cardBorder: '#e5e7eb',
    cardRadius: '12px',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    text: '#374151',
    strong: '#111827',
    muted: '#6b7280',
    rule: '#f3f4f6',
    divider: '#d1d5db',
    buttonBg: '#111827',
    buttonText: '#ffffff',
    buttonRadius: '8px',
    buttonTracking: '0.5px',
    avatarBg: '#7f1d1d',
    avatarInk: '#fca5a5',
  },

  interior: {
    font: 'Georgia, "Times New Roman", Times, serif',
    pageBg: '#F3EFE9',
    cardBg: '#FFFFFF',
    cardBorder: '#E2DACE',
    cardRadius: '4px',
    cardShadow: '0 1px 2px rgba(63, 54, 42, 0.06)',
    text: '#4A443C',
    strong: '#111111',
    muted: '#857C70',
    rule: '#EDE7DD',
    divider: '#CFC6B8',
    buttonBg: '#111111',
    buttonText: '#FCF7F3',
    buttonRadius: '2px',
    buttonTracking: '1.2px',
    avatarBg: '#111111',
    avatarInk: '#C4B9A8',
  },
};

export function emailTheme(category) {
  return THEMES[resolveCategory(category).id] || THEMES.clinic;
}
