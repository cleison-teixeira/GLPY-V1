// GLPY Design System V1 — Input Component
// Authority: docs/glpy-design-system-v1.md
// Rules: always digitável, never slider or wheel picker
// Height: 60px | Radius: 20px | Text: large, centered

import React from 'react';
import { lightColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { fontFamily, fontSize } from '../../theme/typography';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

type Unit = 'kg' | 'cm' | 'lbs' | 'ft' | 'L' | 'ml' | string;

interface GLPYInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  helperText?: string;
  unit?: Unit;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  centerWithUnit?: boolean;
}

export default function GLPYInput({
  value,
  onChange,
  onBlur,
  label,
  helperText,
  unit,
  type = 'text',
  placeholder,
  disabled = false,
  autoFocus = false,
  style,
  centerWithUnit = false,
}: GLPYInputProps) {
  const [focused, setFocused] = React.useState(false);

  // Converte type="number" para type="text" + inputMode="decimal" para remover
  // o spinner nativo do browser no desktop mantendo o teclado decimal no mobile.
  const renderType = type === 'number' ? 'text' : type;
  const renderInputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'] =
    type === 'number' ? 'decimal' : undefined;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    fontWeight: '600',
    color: lightColors.text.secondary,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  const borderStyle = focused
    ? `2px solid ${lightColors.brand.green}`
    : `1.5px solid ${lightColors.border.soft}`;
  const shadowStyle = focused
    ? `0 0 0 3px rgba(106,210,143,0.18)`
    : lightShadows.soft;

  // ── centered value+unit mode ─────────────────────────────────────────────
  if (centerWithUnit && unit) {
    const centeredWrapperStyle: React.CSSProperties = {
      width: '100%',
      height: 60,
      borderRadius: radius.input,
      border: borderStyle,
      background: lightColors.background.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: shadowStyle,
      transition: transition.default,
      opacity: disabled ? 0.55 : 1,
      ...style,
    };

    const centeredInputStyle: React.CSSProperties = {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: fontFamily.primary,
      fontSize: fontSize.h3,
      fontWeight: '600',
      color: lightColors.text.navy,
      textAlign: 'right',
      padding: 0,
      // size-based width — grows with typed content
      width: `${Math.max(value.length, placeholder?.length ?? 3, 3) + 1}ch`,
      minWidth: 40,
      cursor: disabled ? 'not-allowed' : 'text',
    };

    const centeredUnitStyle: React.CSSProperties = {
      fontFamily: fontFamily.primary,
      fontSize: fontSize.bodyDefault,
      fontWeight: '600',
      color: lightColors.text.secondary,
      marginLeft: 8,
      flexShrink: 0,
      lineHeight: 1,
    };

    return (
      <div style={containerStyle}>
        {label && <span style={labelStyle}>{label}</span>}
        <div style={centeredWrapperStyle}>
          <input
            type={renderType}
            inputMode={renderInputMode}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            style={centeredInputStyle}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); onBlur?.(); }}
          />
          <span style={centeredUnitStyle}>{unit}</span>
        </div>
        {helperText && <span style={{ fontFamily: fontFamily.primary, fontSize: fontSize.small, color: lightColors.text.secondary }}>{helperText}</span>}
      </div>
    );
  }

  // ── default mode ─────────────────────────────────────────────────────────
  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 60,
    borderRadius: radius.input,
    border: borderStyle,
    background: lightColors.background.primary,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.h3,
    fontWeight: '600',
    color: lightColors.text.navy,
    textAlign: unit ? 'left' : 'center',
    paddingLeft: 20,
    paddingRight: unit ? 64 : 20,
    outline: 'none',
    transition: transition.default,
    boxShadow: shadowStyle,
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...style,
  };

  const unitStyle: React.CSSProperties = {
    position: 'absolute',
    right: 20,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyDefault,
    fontWeight: '600',
    color: lightColors.text.secondary,
    pointerEvents: 'none',
  };

  const helperStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    color: lightColors.text.secondary,
  };

  return (
    <div style={containerStyle}>
      {label && <span style={labelStyle}>{label}</span>}
      <div style={inputWrapperStyle}>
        <input
          type={renderType}
          inputMode={renderInputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          style={inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
        />
        {unit && <span style={unitStyle}>{unit}</span>}
      </div>
      {helperText && <span style={helperStyle}>{helperText}</span>}
    </div>
  );
}
