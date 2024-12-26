import type { Json } from "@/integrations/supabase/types";

export interface ThemeFonts {
  [key: string]: string[];
  primary: string[];
}

export const isThemeFonts = (json: Json): json is ThemeFonts => {
  if (typeof json !== 'object' || !json) return false;
  
  return Array.isArray((json as any).primary) &&
    (json as any).primary.every((font: any) => typeof font === 'string');
};