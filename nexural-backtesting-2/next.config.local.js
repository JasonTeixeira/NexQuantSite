/** @type {import('next').NextConfig} */
const nextConfig = {
  // Local development configuration for port 3090
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3090',
    NODE_ENV: 'development'
  },
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Optimize for development
  swcMinify: true,
  
  // Enable experimental features for better performance
  experimental: {
    appDir: true
  },
  
  // Development server configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // CORS headers for development
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
