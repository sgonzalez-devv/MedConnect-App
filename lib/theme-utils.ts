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

/**
 * Get Tailwind CSS classes for clinic colors based on preset name
 * Returns an object with bg, text, border, and badge class properties
 */
export function getClinicColors(presetName: string): {
  bg: string
  text: string
  border: string
  badge: string
  borderL: string
} {
  const colorMap: Record<
    string,
    {
      bg: string
      text: string
      border: string
      badge: string
      borderL: string
    }
  > = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      badge: 'bg-teal-200 text-teal-800',
      borderL: 'border-l-teal-500',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-200 text-blue-800',
      borderL: 'border-l-blue-500',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      badge: 'bg-indigo-200 text-indigo-800',
      borderL: 'border-l-indigo-500',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      badge: 'bg-green-200 text-green-800',
      borderL: 'border-l-green-500',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badge: 'bg-purple-200 text-purple-800',
      borderL: 'border-l-purple-500',
    },
  }

  return colorMap[presetName] || colorMap.teal
}
