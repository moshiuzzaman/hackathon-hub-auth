import type { Json } from "@/integrations/supabase/types";

export interface ThemeColors {
  [key: string]: string;
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
}

export const isThemeColors = (json: Json): json is ThemeColors => {
  if (typeof json !== 'object' || !json) return false;
  
  const requiredKeys = [
    'background', 'foreground', 'card', 'cardForeground',
    'popover', 'popoverForeground', 'primary', 'primaryForeground',
    'secondary', 'secondaryForeground', 'muted', 'mutedForeground',
    'accent', 'accentForeground', 'destructive', 'destructiveForeground',
    'border', 'input', 'ring'
  ];
  
  return requiredKeys.every(key => 
    typeof (json as any)[key] === 'string'
  );
};