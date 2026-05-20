// GLPY Design System V1 — Screen Wrapper Component
// Authority: docs/glpy-design-system-v1.md
// Variants: light (Operational System) | dark (Emotional System)
// Always: mobile-first, vertical-first, pb-24 for BottomNav clearance

import React from 'react';
import { lightColors, darkColors } from '../../theme/colors';
import { padding } from '../../theme/spacing';
import { animation, keyframes } from '../../theme/motion';

type Variant = 'light' | 'dark';

interface GLPYScreenProps {
  children: React.ReactNode;
  variant?: Variant;
  noPadding?: boolean;
  noAnimation?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const lightBg = lightColors.background.secondary;
const darkBg  = darkColors.background.primary;

export default function GLPYScreen({
  children,
  variant = 'light',
  noPadding = false,
  noAnimation = false,
  style,
  className,
}: GLPYScreenProps) {
  const screenStyle: React.CSSProperties = {
    minHeight: '100dvh',
    width: '100%',
    maxWidth: 430,
    margin: '0 auto',
    backgroundColor: variant === 'dark' ? darkBg : lightBg,
    paddingLeft:  noPadding ? 0 : padding.screen,
    paddingRight: noPadding ? 0 : padding.screen,
    paddingTop:   noPadding ? 0 : padding.screen,
    paddingBottom: 96,
    overflowX: 'hidden',
    position: 'relative',
    animation: noAnimation ? 'none' : animation.screenIn,
    ...style,
  };

  return (
    <>
      <style>{keyframes.fadeSlideIn}</style>
      <div style={screenStyle} className={className}>
        {children}
      </div>
    </>
  );
}
