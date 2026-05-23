// GLPY Design System V1 — Header Component
// Authority: docs/glpy-design-system-v1.md
// Props: back button optional | title | subtitle optional | right action optional

import React from 'react';
import { lightColors, darkColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap } from '../../theme/spacing';
import { ChevronLeft } from 'lucide-react';
import glpyLogoLight from '@/assets/logos/logo-light.png';

type Variant = 'light' | 'dark';

interface GLPYHeaderProps {
  title: string;
  subtitle?: string;
  variant?: Variant;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: React.CSSProperties;
  showBranding?: boolean;
  className?: string;
}

export default function GLPYHeader({
  title,
  subtitle,
  variant = 'light',
  onBack,
  rightAction,
  style,
  showBranding = false,
  className,
}: GLPYHeaderProps) {
  const isLight = variant === 'light';

  const titleColor    = isLight ? lightColors.text.navy    : '#FFFFFF';
  const subtitleColor = isLight ? lightColors.text.secondary : 'rgba(255,255,255,0.6)';
  const backColor     = isLight ? lightColors.text.navy    : '#FFFFFF';

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

  if (showBranding) {
    const topRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 24,
    };

    const brandTextStyle: React.CSSProperties = {
      fontFamily: fontFamily.primary,
      fontSize: 13,
      fontWeight: 900,
      color: titleColor,
      letterSpacing: '0.04em',
      margin: 0,
    };

    const mainTitleStyle: React.CSSProperties = {
      fontFamily: fontFamily.primary,
      fontSize: 28,
      fontWeight: 900,
      color: titleColor,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      margin: 0,
    };

    const mainSubtitleStyle: React.CSSProperties = {
      fontFamily: fontFamily.primary,
      fontSize: 14,
      color: subtitleColor,
      margin: 0,
      marginTop: 6,
      lineHeight: 1.4,
    };

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: 32, ...style }}>
        <div style={topRowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: gap.medium }}>
            {onBack && (
              <button style={backStyle} onClick={onBack} aria-label="Voltar">
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
            )}
            <img src={glpyLogoLight} alt="GLPY" style={{ width: 84, height: 'auto', objectFit: 'contain' }} />
          </div>
          {rightAction && (
            <div style={{ flexShrink: 0 }}>
              {rightAction}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h1 style={mainTitleStyle}>{title}</h1>
          {subtitle && <p style={mainSubtitleStyle}>{subtitle}</p>}
        </div>
      </div>
    );
  }

  // Variant B (Default Minimalist style)
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
    <div className={className} style={containerStyle}>
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
