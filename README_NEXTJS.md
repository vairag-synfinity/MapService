# Map Poster Generator - Next.js Version

Next.js implementation of the map poster generator with the same functionality as the Python version.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Web Interface

Visit the homepage and fill in:
- **City**: e.g., "New York"
- **Country**: e.g., "USA"
- **Theme**: Select from available themes
- **Distance**: Map radius in meters (default: 29000)

Click "Generate Poster" to create and download the poster.

### API Endpoint

```bash
GET /api/poster?city=New%20York&country=USA&theme=noir&distance=12000
```

Returns PNG image directly.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── poster/
│   │       └── route.ts      # API route for poster generation
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage UI
├── lib/
│   ├── geocoder.ts           # Geocoding using node-geocoder
│   ├── overpass.ts           # OSM data fetching via Overpass API
│   ├── renderer.ts           # Canvas rendering
│   └── theme.ts              # Theme loading
├── themes/                   # Theme JSON files (shared with Python version)
├── fonts/                    # Roboto fonts (shared with Python version)
└── posters/                  # Generated posters
```

## Features

- Same functionality as Python version
- All 17 themes supported
- High-resolution output (3600x4800px, 300 DPI equivalent)
- Typography with Roboto fonts
- Gradient fades
- Road hierarchy styling
- Water and park layers

## Notes

- Requires Node.js 18+
- Canvas library requires system dependencies (see [node-canvas](https://github.com/Automattic/node-canvas))
- Uses Overpass API (public service, may have rate limits)