// GLPY Design System V1 — Button Component
// Authority: docs/glpy-design-system-v1.md
// Variants: primary | secondary | ghost
// Sizes: sm | md | lg

import React from 'react';
import { lightColors, darkColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { fontFamily, fontWeight } from '../../theme/typography';
import { transition, scale } from '../../theme/motion';
import { lightShadows } from '../../theme/shadows';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface GLPYButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}

const HEIGHT: Record<Size, number> = { sm: 40, md: 56, lg: 64 };
const FONT:   Record<Size, number> = { sm: 14, md: 16, lg: 18 };
const PX:     Record<Size, number> = { sm: 16, md: 24, lg: 32 };

function getVariantStyle(variant: Variant, disabled: boolean): React.CSSProperties {
  if (variant === 'primary') {
    return {
      background: disabled
        ? lightColors.text.secondary
        : `linear-gradient(135deg, ${lightColors.brand.green}, ${lightColors.brand.greenDark})`,
      color: '#FFFFFF',
      border: 'none',
      boxShadow: disabled ? 'none' : `0 4px 16px rgba(106,210,143,0.35)`,
    };
  }
  if (variant === 'secondary') {
    return {
      background: lightColors.background.primary,
      color: disabled ? lightColors.text.secondary : lightColors.text.navy,
      border: `1.5px solid ${lightColors.border.soft}`,
      boxShadow: lightShadows.soft,
    };
  }
  // ghost
  return {
    background: 'transparent',
    color: disabled ? lightColors.text.secondary : lightColors.brand.green,
    border: 'none',
    boxShadow: 'none',
  };
}

export default function GLPYButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style,
}: GLPYButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  const variantStyle = getVariantStyle(variant, disabled);

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: HEIGHT[size],
    paddingLeft: PX[size],
    paddingRight: PX[size],
    borderRadius: radius.button,
    fontFamily: fontFamily.primary,
    fontSize: FONT[size],
    fontWeight: fontWeight.h2,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: transition.button,
    transform: pressed && !disabled ? `scale(${scale.buttonPress})` : 'scale(1)',
    outline: 'none',
    userSelect: 'none',
    ...variantStyle,
    ...style,
  };

  return (
    <button
      type={type}
      style={baseStyle}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </button>
  );
}
