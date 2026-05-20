// GLPY Design System V1 — Typography Tokens
// Authority: docs/glpy-design-system-v1.md

export const fontFamily = {
  primary:  'Inter, "SF Pro Display", sans-serif',
} as const;

export const fontSize = {
  h1:          32,
  h2:          28,
  h3:          22,
  bodyLarge:   18,
  bodyDefault: 16,
  small:       14,
} as const;

export const fontWeight = {
  h1: '700',
  h2: '700',
  h3: '600',
} as const;

const typography = { fontFamily, fontSize, fontWeight } as const;

export default typography;
