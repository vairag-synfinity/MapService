'use client';

import { useState } from 'react';

export default function Home() {
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [theme, setTheme] = useState('feature_based');
    const [distance, setDistance] = useState('29000');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const themes = [
        'feature_based', 'noir', 'blueprint', 'midnight_blue', 'ocean',
        'warm_beige', 'pastel_dream', 'japanese_ink', 'forest', 'terracotta',
        'sunset', 'autumn', 'copper_patina', 'monochrome_blue', 'neon_cyberpunk',
        'gradient_roads', 'contrast_zones'
    ];

    const handleGenerate = async () => {
        const hasLatLon = latitude && longitude;
        const hasCityCountry = city && country;

        if (!hasLatLon && !hasCityCountry) {
            setError('Please enter either city & country OR latitude & longitude');
            return;
        }

        setLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const params = new URLSearchParams({
                theme,
                distance,
            });

            if (hasLatLon) {
                params.append('lat', latitude);
                params.append('lon', longitude);
            } else {
                params.append('city', city);
                params.append('country', country);
            }

            const response = await fetch(`/api/poster?${params.toString()}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate poster');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1>Map Poster Generator</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>City</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., New York"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Country</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., USA"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        OR use coordinates:
                    </label>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Latitude</label>
                    <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g., 40.7128"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Longitude</label>
                    <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g., -74.0060"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Theme</label>
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    >
                        {themes.map((t) => (
                            <option key={t} value={t}>
                                {t.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Distance (meters, default: 29000)
                    </label>
                    <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        placeholder="29000"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        fontSize: '1rem',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Generating...' : 'Generate Poster'}
                </button>

                {error && (
                    <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}
            </div>

            {imageUrl && (
                <div>
                    <img
                        src={imageUrl}
                        alt="Generated poster"
                        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
                    />
                    <div style={{ marginTop: '1rem' }}>
                        <a
                            href={imageUrl}
                            download={`${city}_${theme}.png`}
                            style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#0070f3',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                            }}
                        >
                            Download
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}