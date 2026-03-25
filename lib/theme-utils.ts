import type { ClinicColorPalette } from '@/lib/types'
import React from 'react'

// Color presets using oklch color space
const presets = {
  'teal': {
    primary: 'oklch(0.52 0.18 181)',
    accent: 'oklch(0.70 0.19 163)',
  },
  'blue': {
    primary: 'oklch(0.49 0.13 263)',
    accent: 'oklch(0.61 0.19 255)',
  },
  'indigo': {
    primary: 'oklch(0.43 0.17 280)',
    accent: 'oklch(0.60 0.13 286)',
  },
  'green': {
    primary: 'oklch(0.51 0.17 142)',
    accent: 'oklch(0.68 0.18 135)',
  },
  'purple': {
    primary: 'oklch(0.49 0.18 308)',
    accent: 'oklch(0.65 0.22 305)',
  },
}

/**
 * Generate CSS variables for a clinic color palette
 * Returns an object with --clinic-primary and --clinic-accent keys
 * If customSecondaryHex is provided, it overrides the accent color
 */
export function generateClinicCSSVariables(
  palette: ClinicColorPalette
): Record<string, string> {
  const preset = presets[palette.presetName] || presets.teal

  return {
    '--clinic-primary': preset.primary,
    '--clinic-accent': palette.customSecondaryHex || preset.accent,
  }
}

/**
 * Convert clinic CSS variables to React CSSProperties
 * Enables inline style application: style={getCSSVariablesAsReactStyle(clinic.colorPalette)}
 */
export function getCSSVariablesAsReactStyle(
  palette: ClinicColorPalette
): React.CSSProperties {
  const variables = generateClinicCSSVariables(palette)
  return variables as any as React.CSSProperties
}
