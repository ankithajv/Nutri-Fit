/**
 * NutriFit Design Tokens
 * Warm, motivating, professional — friendly health coach palette.
 * Source of truth for all JS/TS colour references.
 * Only these values are permitted; no blue, pink, teal, or purple gradients.
 */

export const tokens = {
  // ── Backgrounds & surfaces ──────────────────────────────────────────
  cream100:  '#FFFFFF',   // main background
  cream200:  '#F8F8F5',   // subtle background
  card:      '#FFFFFF',   // card background
  cardSoft:  '#F8F8F5',   // subtle card background
  line:      '#F0F0F0',   // subtle border

  // ── Brand ───────────────────────────────────────────────────────────
  olive500:    '#547A46', // fresh green
  olive700:    '#2E4A24', // dark green
  olive100:    '#EAF2E5', // light green
  orange500:   '#F28C38', // accent orange
  orange100:   '#FFF1E5', // light orange
  dark900:     '#202020', // primary charcoal
  dark800:     '#333333', // secondary dark
  lavender200: '#82A874', // neutral green for fats

  // ── Text ────────────────────────────────────────────────────────────
  ink:     '#202020', // primary text
  ink2:    '#777777', // secondary text
  ink3:    '#9CA3AF', // muted text
  onDark:  '#FFFFFF',
  onDark2: '#D1D5DB',

  // ── Status ──────────────────────────────────────────────────────────
  good:      '#547A46',
  goodBg:    '#EAF2E5',
  caution:   '#F28C38',
  cautionBg: '#FFF1E5',
  alert:     '#DC2626',
  alertBg:   '#FEE2E2',

  // ── Charts ──────────────────────────────────────────────────────────
  chartProtein:   '#547A46', // fresh green
  chartCarbs:     '#F28C38', // accent orange
  chartFat:       '#82A874', // neutral green
  chartEmpty:     '#F0F0F0', // subtle track
  chartTrackDark: '#333333',

  // ── Meal card block colours ──────────────────────────────────────────
  mealBreakfast: '#EEEBC0', // olive-100
  mealBrunch:    'rgba(217,194,242,0.4)', // lavender-200 @ 40%
  mealLunch:     '#B8B240', // olive-500
  mealSnacks:    '#FFE3CC', // orange-100
  mealDinner:    '#33321E', // dark-900

  // ── Shape ───────────────────────────────────────────────────────────
  radiusCard:  '28px',
  radiusInner: '20px',
  radiusPill:  '999px',
  radiusSm:    '8px',

  // ── Shadows ─────────────────────────────────────────────────────────
  shadowCard: '0 4px 16px rgba(51, 50, 30, 0.08)',

  // ── Animations ──────────────────────────────────────────────────────
  easeNatural: 'cubic-bezier(0.22, 1, 0.36, 1)',
  durMicro:    '120ms',
  durStd:      '200ms',
  durEmphasis: '400ms',

  // ── Legacy compatibility aliases (mapped to new palette) ─────────────
  /** @deprecated use olive700 */ accent:      '#7A781F',
  /** @deprecated use olive100 */ accentLight: '#EEEBC0',
  /** @deprecated use olive700 */ accentDark:  '#7A781F',
  /** @deprecated use ink2    */ muted:       '#6B6755',
  /** @deprecated use caution */ warning:     '#B86E00',
  /** @deprecated use alert   */ danger:      '#C2412E',
  /** @deprecated use good    */ success:     '#7A781F',
  /** @deprecated use cream100 */ bg:         '#F7EEE3',
  /** @deprecated use card    */ surface:     '#FFFFFF',
  /** @deprecated use cardSoft */ surfaceSoft: '#FBF5EC',
  /** @deprecated use line    */ border:      '#E8D9C5',
  /** @deprecated use ink     */ text:        '#2A2815',
  /** @deprecated use ink2    */ text2:       '#6B6755',
  /** @deprecated use ink3    */ text3:       '#9A9582',
};

export type TokenKey = keyof typeof tokens;

/** Meal type to block-colour mapping */
export const mealColors = {
  breakfast: { bg: tokens.mealBreakfast, text: tokens.ink },
  brunch:    { bg: tokens.mealBrunch,    text: tokens.ink },
  lunch:     { bg: tokens.mealLunch,     text: tokens.ink },
  snacks:    { bg: tokens.mealSnacks,    text: tokens.ink },
  dinner:    { bg: tokens.mealDinner,    text: tokens.onDark },
} as const;

/** Motivational daily quotes — rotates by day-of-year */
export const dailyMotivations = [
  'Every nutritious choice is a vote for the future you.',
  'Small steps, big results. You\'ve got this today.',
  'Fuel well, feel great — one meal at a time.',
  'Consistency is your superpower. Keep showing up.',
  'Your body thrives when you give it what it needs.',
  'Progress, not perfection. Today counts.',
  'Eat with intention. Live with energy.',
];

export function getDailyMotivation(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return dailyMotivations[dayOfYear % dailyMotivations.length];
}
