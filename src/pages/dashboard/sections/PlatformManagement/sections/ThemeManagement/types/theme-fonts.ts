import type { Json } from "@/integrations/supabase/types";

export interface ThemeFonts {
  [key: string]: string[];
  sans: string[];
  serif: string[];
  mono: string[];
}

export const isThemeFonts = (json: Json): json is ThemeFonts => {
  if (typeof json !== 'object' || !json) return false;
  
  const requiredKeys = ['sans', 'serif', 'mono'];
  
  return requiredKeys.every(key => 
    Array.isArray((json as any)[key]) &&
    (json as any)[key].every((font: any) => typeof font === 'string')
  );
};