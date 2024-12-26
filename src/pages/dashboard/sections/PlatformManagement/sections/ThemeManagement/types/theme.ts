import type { Json } from "@/integrations/supabase/types";

export interface ThemeColors {
  [key: string]: string;
  primary: string;
  secondary: string;
}

export interface ThemeFonts {
  [key: string]: string[];
  primary: string[];
}

export interface Theme {
  id: string;
  name: string;
  type: 'default' | 'custom';
  is_active: boolean;
  colors: ThemeColors;
  fonts: ThemeFonts;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ThemeFormData = {
  name: string;
  type: 'default' | 'custom';
  is_active: boolean;
  colors: ThemeColors;
  fonts: ThemeFonts;
};

export const parseTheme = (data: {
  id: string;
  name: string;
  type: 'default' | 'custom';
  is_active: boolean;
  colors: Json;
  fonts: Json;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}): Theme | null => {
  if (!isThemeColors(data.colors) || !isThemeFonts(data.fonts)) {
    console.error('Invalid theme data structure', data);
    return null;
  }

  return {
    ...data,
    colors: data.colors,
    fonts: data.fonts,
  };
};

const isThemeColors = (json: Json): json is ThemeColors => {
  if (typeof json !== 'object' || !json) return false;
  
  const requiredKeys = ['primary', 'secondary'];
  
  return requiredKeys.every(key => 
    typeof (json as any)[key] === 'string'
  );
};

const isThemeFonts = (json: Json): json is ThemeFonts => {
  if (typeof json !== 'object' || !json) return false;
  
  return Array.isArray((json as any).primary) &&
    (json as any).primary.every((font: any) => typeof font === 'string');
};