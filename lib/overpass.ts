import axios from 'axios';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

interface OverpassResponse {
    elements: Array<{
        type: 'node' | 'way' | 'relation';
        id: number;
        tags?: Record<string, string>;
        nodes?: number[];
        geometry?: Array<{ lat: number; lon: number }>;
    }>;
}

export async function fetchOSMData(
    lat: number,
    lon: number,
    distance: number
): Promise<{
    roads: any[];
    water: any[];
    parks: any[];
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}> {
    // Calculate bounding box (south, west, north, east)
    const radiusDegrees = distance / 111320; // meters to degrees (approximate)
    const minLat = lat - radiusDegrees;
    const maxLat = lat + radiusDegrees;
    const minLon = lon - radiusDegrees;
    const maxLon = lon + radiusDegrees;
    const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;

    // Overpass query for roads
    const roadsQuery = `[out:json][timeout:60];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|living_street|unclassified|service|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)"](${bbox});
);
out geom;`;

    // Overpass query for water
    const waterQuery = `[out:json][timeout:60];
(
  way["natural"="water"](${bbox});
  way["waterway"="riverbank"](${bbox});
);
out geom;`;

    // Overpass query for parks
    const parksQuery = `[out:json][timeout:60];
(
  way["leisure"="park"](${bbox});
  way["landuse"="grass"](${bbox});
);
out geom;`;

    const [roadsRes, waterRes, parksRes] = await Promise.all([
        axios.post<OverpassResponse>(OVERPASS_API, roadsQuery, {
            headers: { 'Content-Type': 'text/plain' },
        }),
        axios.post<OverpassResponse>(OVERPASS_API, waterQuery, {
            headers: { 'Content-Type': 'text/plain' },
        }).catch(() => ({ data: { elements: [] } })),
        axios.post<OverpassResponse>(OVERPASS_API, parksQuery, {
            headers: { 'Content-Type': 'text/plain' },
        }).catch(() => ({ data: { elements: [] } })),
    ]);

    return {
        roads: roadsRes.data.elements,
        water: waterRes.data.elements,
        parks: parksRes.data.elements,
        bounds: {
            minLat,
            maxLat,
            minLon,
            maxLon,
        },
    };
}