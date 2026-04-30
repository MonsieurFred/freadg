/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: '/Users/Guillaume/Documents/freadg',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
