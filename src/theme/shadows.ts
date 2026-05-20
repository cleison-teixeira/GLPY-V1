// GLPY Design System V1 — Shadow Tokens
// Authority: docs/glpy-design-system-v1.md

export const lightShadows = {
  card: '0 8px 24px rgba(0,0,0,0.06)',
  soft: '0 4px 12px rgba(0,0,0,0.04)',
} as const;

export const darkShadows = {
  glow: '0 0 32px rgba(106,210,143,0.25)',
  deep: '0 12px 40px rgba(0,0,0,0.45)',
} as const;

const shadows = { light: lightShadows, dark: darkShadows } as const;

export default shadows;
