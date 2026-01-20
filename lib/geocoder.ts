import axios from 'axios';

export async function getCoordinates(city: string, country: string): Promise<[number, number]> {
    const query = encodeURIComponent(`${city}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'MapPosterGenerator/1.0',
        },
    });

    console.log(response.data, "--------------------------------my response data--------------------------------");

    if (!response.data || response.data.length === 0) {
        throw new Error(`Could not find coordinates for ${city}, ${country}`);
    }

    const location = response.data[0];
    return [parseFloat(location.lat), parseFloat(location.lon)];
}