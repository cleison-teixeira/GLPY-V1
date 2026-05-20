// GLPY Design System V1 — Header Component
// Authority: docs/glpy-design-system-v1.md
// Props: back button optional | title | subtitle optional | right action optional

import React from 'react';
import { lightColors, darkColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap } from '../../theme/spacing';
import { ChevronLeft } from 'lucide-react';

type Variant = 'light' | 'dark';

interface GLPYHeaderProps {
  title: string;
  subtitle?: string;
  variant?: Variant;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function GLPYHeader({
  title,
  subtitle,
  variant = 'light',
  onBack,
  rightAction,
  style,
}: GLPYHeaderProps) {
  const isLight = variant === 'light';

  const titleColor    = isLight ? lightColors.text.navy    : '#FFFFFF';
  const subtitleColor = isLight ? lightColors.text.secondary : 'rgba(255,255,255,0.6)';
  const backColor     = isLight ? lightColors.text.navy    : '#FFFFFF';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: gap.large,
    minHeight: 44,
    ...style,
  };

  const leftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: gap.small,
    flex: 1,
  };

  const backStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    background: isLight ? lightColors.background.secondary : 'rgba(255,255,255,0.08)',
    border: isLight ? `1px solid ${lightColors.border.soft}` : 'none',
    cursor: 'pointer',
    flexShrink: 0,
    color: backColor,
  };

  const textBlockStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.h2,
    color: titleColor,
    lineHeight: 1.2,
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    color: subtitleColor,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        {onBack && (
          <button style={backStyle} onClick={onBack} aria-label="Voltar">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
        )}
        <div style={textBlockStyle}>
          <p style={titleStyle}>{title}</p>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>
      </div>
      {rightAction && (
        <div style={{ flexShrink: 0, marginLeft: gap.medium }}>
          {rightAction}
        </div>
      )}
    </div>
  );
}
