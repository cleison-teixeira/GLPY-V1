// GLPY Design System V1 — Card Component
// Authority: docs/glpy-design-system-v1.md
// Variants: light | dark

import React from 'react';
import { lightColors, darkColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { padding } from '../../theme/spacing';
import { lightShadows, darkShadows } from '../../theme/shadows';
import { transition, scale } from '../../theme/motion';

type Variant = 'light' | 'dark';

interface GLPYCardProps {
  children: React.ReactNode;
  variant?: Variant;
  hoverable?: boolean;
  onClick?: () => void;
  noPadding?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

function getCardStyle(variant: Variant): React.CSSProperties {
  if (variant === 'dark') {
    return {
      background: darkColors.background.card,
      boxShadow: darkShadows.glow,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: `1px solid rgba(106,210,143,0.12)`,
    };
  }
  // light
  return {
    background: lightColors.background.card,
    boxShadow: lightShadows.card,
    border: `1px solid ${lightColors.border.soft}`,
  };
}

export default function GLPYCard({
  children,
  variant = 'light',
  hoverable = false,
  onClick,
  noPadding = false,
  style,
  className,
}: GLPYCardProps) {
  const [hovered, setHovered] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    borderRadius: radius.main,
    padding: noPadding ? 0 : padding.card,
    transition: transition.cardHover,
    transform: hoverable && hovered ? `scale(${scale.cardHover})` : 'scale(1)',
    cursor: onClick ? 'pointer' : 'default',
    overflow: 'hidden',
    ...getCardStyle(variant),
    ...style,
  };

  return (
    <div
      style={baseStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
    >
      {children}
    </div>
  );
}
