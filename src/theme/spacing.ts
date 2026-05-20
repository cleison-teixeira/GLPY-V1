// GLPY Design System V1 — Spacing Tokens
// Authority: docs/glpy-design-system-v1.md

export const padding = {
  screen: 24,
  card:   20,
  small:  12,
} as const;

export const gap = {
  large:  24,
  medium: 16,
  small:   8,
} as const;

const spacing = { padding, gap } as const;

export default spacing;
