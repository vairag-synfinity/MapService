import fs from 'fs';
import path from 'path';

const THEMES_DIR = path.join(process.cwd(), 'themes');

export interface Theme {
  name: string;
  description?: string;
  bg: string;
  text: string;
  gradient_color: string;
  water: string;
  parks: string;
  road_motorway: string;
  road_primary: string;
  road_secondary: string;
  road_tertiary: string;
  road_residential: string;
  road_default: string;
}

export function loadTheme(themeName: string = 'feature_based'): Theme {
  const themeFile = path.join(THEMES_DIR, `${themeName}.json`);
  
  if (!fs.existsSync(themeFile)) {
    // Default theme
    return {
      name: 'Feature-Based Shading',
      bg: '#FFFFFF',
      text: '#000000',
      gradient_color: '#FFFFFF',
      water: '#C0C0C0',
      parks: '#F0F0F0',
      road_motorway: '#0A0A0A',
      road_primary: '#1A1A1A',
      road_secondary: '#2A2A2A',
      road_tertiary: '#3A3A3A',
      road_residential: '#4A4A4A',
      road_default: '#3A3A3A',
    };
  }
  
  const themeData = JSON.parse(fs.readFileSync(themeFile, 'utf-8'));
  return themeData as Theme;
}

export function getAvailableThemes(): string[] {
  if (!fs.existsSync(THEMES_DIR)) {
    return [];
  }
  
  return fs
    .readdirSync(THEMES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace('.json', ''))
    .sort();
}