import type { Json } from "@/integrations/supabase/types";

export interface ThemeColors {
  [key: string]: string;
  primary: string;
  secondary: string;
}

export const isThemeColors = (json: Json): json is ThemeColors => {
  if (typeof json !== 'object' || !json) return false;
  
  const requiredKeys = ['primary', 'secondary'];
  
  return requiredKeys.every(key => 
    typeof (json as any)[key] === 'string'
  );
};