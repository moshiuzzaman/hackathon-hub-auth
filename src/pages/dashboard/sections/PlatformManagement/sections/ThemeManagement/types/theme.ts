import { ThemeColors, isThemeColors } from "./theme-colors";
import { ThemeFonts, isThemeFonts } from "./theme-fonts";
import type { Json } from "@/integrations/supabase/types";

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

export type { ThemeColors, ThemeFonts };