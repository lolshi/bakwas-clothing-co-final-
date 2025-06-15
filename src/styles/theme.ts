// Theme configuration for consistent styling across the application

export const colors = {
  text: {
    primary: 'text-gray-800 dark:text-gray-100',
    secondary: 'text-gray-700 dark:text-gray-300',
    subtle: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-400',
  },
  background: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
    active: 'bg-gray-100 dark:bg-gray-800/60',
  },
  border: {
    default: 'border-gray-200 dark:border-gray-700',
    subtle: 'border-gray-100 dark:border-gray-800',
    strong: 'border-gray-300 dark:border-gray-600',
  },
  icon: {
    default: 'text-gray-500 dark:text-gray-400',
    subtle: 'text-gray-400 dark:text-gray-500',
    strong: 'text-gray-600 dark:text-gray-300',
  },
} as const;

export const typography = {
  h1: 'text-3xl font-semibold',
  h2: 'text-2xl font-semibold',
  h3: 'text-lg font-semibold',
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
} as const;

export const spacing = {
  card: 'p-5',
  cardCompact: 'p-4',
  section: 'p-6',
  gap: 'gap-6',
  gapSmall: 'gap-4',
  gapTiny: 'gap-2',
} as const;

export const layout = {
  card: `rounded-lg border ${colors.border.default} ${colors.background.secondary}`,
  table: {
    header: `${colors.background.active}`,
    cell: 'py-4',
    row: `border-t ${colors.border.default}`,
  },
  modal: {
    backdrop: 'bg-black/30 backdrop-blur-sm',
    container: `${colors.background.primary} rounded-lg shadow-lg`,
    header: `border-b ${colors.border.default} p-6`,
    body: 'p-6',
    footer: `border-t ${colors.border.default} p-6`,
  },
} as const;

// Example usage:
// import { colors, typography, spacing, layout } from '@/styles/theme';
//
// <div className={`${layout.card} ${spacing.card}`}>
//   <h3 className={`${typography.h3} ${colors.text.primary}`}>Title</h3>
//   <p className={`${typography.body} ${colors.text.secondary}`}>Content</p>
// </div> 