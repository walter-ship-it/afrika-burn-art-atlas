
export const categoryColors = {
  artwork: '#F97316', // orange
  theme_camp: '#1EAEDB', // blue
  support_camp: '#F2FCE2', // green
  medics: '#ea384c', // red
  default: '#8E9196' // gray
} as const;

export type Category = keyof typeof categoryColors;
