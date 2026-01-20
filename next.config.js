/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverComponentsExternalPackages: ['@napi-rs/canvas'],
}

module.exports = nextConfig