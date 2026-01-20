import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Map Poster Generator',
    description: 'Generate beautiful map posters for any city',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}