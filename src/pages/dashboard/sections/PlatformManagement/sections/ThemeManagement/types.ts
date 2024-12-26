export interface Theme {
  id: string;
  name: string;
  type: 'default' | 'custom';
  is_active: boolean;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  fonts: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  created_at: string;
  updated_at: string;
  created_by: string | null;
}