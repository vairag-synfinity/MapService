import { NextRequest, NextResponse } from 'next/server';
import { getCoordinates } from '@/lib/geocoder';
import { fetchOSMData } from '@/lib/overpass';
import { loadTheme } from '@/lib/theme';
import { renderPoster } from '@/lib/renderer';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const themeName = searchParams.get('theme') || 'feature_based';
    const distance = parseInt(searchParams.get('distance') || '29000');

    const hasLatLon = lat && lon;
    const hasCityCountry = city && country;

    if (!hasLatLon && !hasCityCountry) {
        return NextResponse.json({ error: 'Either city & country OR latitude & longitude are required' }, { status: 400 });
    }

    try {
        // Load theme
        const theme = loadTheme(themeName);

        // Get coordinates
        let coords: [number, number];
        let displayCity = city || 'Location';
        let displayCountry = country || '';

        if (hasLatLon) {
            coords = [parseFloat(lat!), parseFloat(lon!)];
            if (!city) {
                displayCity = `${lat}, ${lon}`;
            }
        } else {
            coords = await getCoordinates(city!, country!);
            displayCity = city!;
            displayCountry = country!;
        }

        // Fetch OSM data
        const { roads, water, parks, bounds } = await fetchOSMData(coords[0], coords[1], distance);

        // Render poster
        const imageBuffer = renderPoster(displayCity, displayCountry, coords, roads as any, water as any, parks as any, bounds, theme);

        // Return image
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace(/T/g, '_');
        const filename = `${displayCity.toLowerCase().replace(/\s+/g, '_')}_${themeName}_${timestamp}.png`;
        return new NextResponse(Buffer.from(imageBuffer), {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `inline; filename="${filename}"`,
            },
        });
    } catch (error: any) {
        console.error('Error generating poster:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate poster' }, { status: 500 });
    }
}