// GLPY Design System V1 — Color Tokens
// Authority: docs/glpy-design-system-v1.md
// Do NOT add colors outside this file.

export const lightColors = {
  background: {
    primary:   '#FFFFFF',
    secondary: '#F7F8FA',
    card:      '#FFFFFF',
  },
  brand: {
    green:     '#6AD28F',
    greenDark: '#3FAE68',
  },
  text: {
    navy:      '#16213E',
    secondary: '#6B7280',
  },
  border: {
    soft: '#E5E7EB',
  },
} as const;

export const darkColors = {
  background: {
    primary:   '#0B1020',
    secondary: '#121A2E',
    card:      '#161F36',
  },
  glow: {
    metabolic: '#6AD28F',
    purple:    '#8B5CF6',
    blue:      '#3B82F6',
  },
} as const;

const colors = { light: lightColors, dark: darkColors } as const;

export default colors;
