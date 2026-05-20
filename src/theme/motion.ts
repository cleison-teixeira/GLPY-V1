// GLPY Design System V1 — Motion Tokens
// Authority: docs/glpy-design-system-v1.md
// Animations must be: smooth, elegant, fast, discrete, premium.
// Never: exaggerated, slow, flashy.

export const scale = {
  cardHover:   1.02,
  buttonPress: 0.98,
} as const;

export const transition = {
  screenIn:  'opacity 0.22s ease, transform 0.22s ease',
  cardHover: 'transform 0.18s ease',
  button:    'transform 0.12s ease',
  default:   'all 0.18s ease',
} as const;

export const animation = {
  screenIn: 'fadeSlideIn 0.22s ease forwards',
} as const;

export const keyframes = {
  fadeSlideIn: `
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
  `,
} as const;

const motion = { scale, transition, animation, keyframes } as const;

export default motion;
