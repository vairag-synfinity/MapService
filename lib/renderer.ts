import { createCanvas, registerFont, loadImage } from 'canvas';
import path from 'path';
import { Theme } from './theme';

const FONTS_DIR = path.join(process.cwd(), 'fonts');
const WIDTH = 3600; // 12 inches at 300 DPI
const HEIGHT = 4800; // 16 inches at 300 DPI

// Register fonts
try {
    registerFont(path.join(FONTS_DIR, 'Roboto-Bold.ttf'), { family: 'Roboto', weight: 'bold' });
    registerFont(path.join(FONTS_DIR, 'Roboto-Regular.ttf'), { family: 'Roboto', weight: 'normal' });
    registerFont(path.join(FONTS_DIR, 'Roboto-Light.ttf'), { family: 'Roboto', weight: '300' });
} catch (e) {
    console.warn('Fonts not found, using system fonts');
}

interface RoadWay {
    type: 'way';
    id: number;
    tags: Record<string, string>;
    geometry?: Array<{ lat: number; lon: number }>;
}

interface PolygonWay {
    type: 'way';
    id: number;
    tags: Record<string, string>;
    geometry?: Array<{ lat: number; lon: number }>;
}

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ]
        : [0, 0, 0];
}

function getRoadColor(highway: string, theme: Theme): string {
    if (['motorway', 'motorway_link'].includes(highway)) {
        return theme.road_motorway;
    }
    if (['trunk', 'trunk_link', 'primary', 'primary_link'].includes(highway)) {
        return theme.road_primary;
    }
    if (['secondary', 'secondary_link'].includes(highway)) {
        return theme.road_secondary;
    }
    if (['tertiary', 'tertiary_link'].includes(highway)) {
        return theme.road_tertiary;
    }
    if (['residential', 'living_street', 'unclassified'].includes(highway)) {
        return theme.road_residential;
    }
    return theme.road_default;
}

function getRoadWidth(highway: string): number {
    if (['motorway', 'motorway_link'].includes(highway)) {
        return 3.6; // 1.2 * 3 (scale factor)
    }
    if (['trunk', 'trunk_link', 'primary', 'primary_link'].includes(highway)) {
        return 3.0;
    }
    if (['secondary', 'secondary_link'].includes(highway)) {
        return 2.4;
    }
    if (['tertiary', 'tertiary_link'].includes(highway)) {
        return 1.8;
    }
    return 1.2;
}

function projectPoint(
    lat: number,
    lon: number,
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
    width: number,
    height: number
): [number, number] {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
    const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return [x, y];
}

export function renderPoster(
    city: string,
    country: string,
    coords: [number, number],
    roads: RoadWay[],
    water: PolygonWay[],
    parks: PolygonWay[],
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
    theme: Theme
): Buffer {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw water polygons
    ctx.fillStyle = theme.water;
    for (const way of water) {
        if (!way.geometry || way.geometry.length < 3) continue;
        ctx.beginPath();
        const first = projectPoint(way.geometry[0].lat, way.geometry[0].lon, bounds, WIDTH, HEIGHT);
        ctx.moveTo(first[0], first[1]);
        for (let i = 1; i < way.geometry.length; i++) {
            const point = projectPoint(way.geometry[i].lat, way.geometry[i].lon, bounds, WIDTH, HEIGHT);
            ctx.lineTo(point[0], point[1]);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Draw parks
    ctx.fillStyle = theme.parks;
    for (const way of parks) {
        if (!way.geometry || way.geometry.length < 3) continue;
        ctx.beginPath();
        const first = projectPoint(way.geometry[0].lat, way.geometry[0].lon, bounds, WIDTH, HEIGHT);
        ctx.moveTo(first[0], first[1]);
        for (let i = 1; i < way.geometry.length; i++) {
            const point = projectPoint(way.geometry[i].lat, way.geometry[i].lon, bounds, WIDTH, HEIGHT);
            ctx.lineTo(point[0], point[1]);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Draw roads
    for (const way of roads) {
        if (!way.geometry || way.geometry.length < 2) continue;
        const highway = way.tags?.highway || 'unclassified';
        const color = getRoadColor(highway, theme);
        const width = getRoadWidth(highway);

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const first = projectPoint(way.geometry[0].lat, way.geometry[0].lon, bounds, WIDTH, HEIGHT);
        ctx.moveTo(first[0], first[1]);
        for (let i = 1; i < way.geometry.length; i++) {
            const point = projectPoint(way.geometry[i].lat, way.geometry[i].lon, bounds, WIDTH, HEIGHT);
            ctx.lineTo(point[0], point[1]);
        }
        ctx.stroke();
    }

    // Gradient fades
    const gradientHeight = HEIGHT * 0.25;
    const rgb = hexToRgb(theme.gradient_color);

    // Bottom gradient
    const bottomGradient = ctx.createLinearGradient(0, HEIGHT - gradientHeight, 0, HEIGHT);
    bottomGradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
    bottomGradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, HEIGHT - gradientHeight, WIDTH, gradientHeight);

    // Top gradient
    const topGradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
    topGradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
    topGradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, WIDTH, gradientHeight);

    // Typography
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // City name (spaced)
    const spacedCity = city.toUpperCase().split('').join('  ');
    ctx.font = 'bold 180px Roboto';
    ctx.fillText(spacedCity, WIDTH / 2, HEIGHT * 0.14);

    // Decorative line
    ctx.strokeStyle = theme.text;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(WIDTH * 0.4, HEIGHT * 0.125);
    ctx.lineTo(WIDTH * 0.6, HEIGHT * 0.125);
    ctx.stroke();

    // Country name
    ctx.font = '300 66px Roboto';
    ctx.fillText(country.toUpperCase(), WIDTH / 2, HEIGHT * 0.10);

    // Coordinates
    const [lat, lon] = coords;
    let coordStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'} / ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
    ctx.font = 'normal 42px Roboto';
    ctx.globalAlpha = 0.7;
    ctx.fillText(coordStr, WIDTH / 2, HEIGHT * 0.07);
    ctx.globalAlpha = 1.0;

    // Attribution
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.font = '300 24px Roboto';
    ctx.globalAlpha = 0.5;
    ctx.fillText('© OpenStreetMap contributors', WIDTH * 0.98, HEIGHT * 0.02);
    ctx.globalAlpha = 1.0;

    return canvas.toBuffer('image/png');
}