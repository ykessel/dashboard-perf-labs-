/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@radix-ui/react-alert-dialog', '@radix-ui/react-checkbox', '@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-slot'],
    // Remove optimizeCss to avoid critters issues in production
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Compression
  compress: true,
  // Custom webpack configuration for CSS optimization
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production builds
    if (!dev && !isServer) {
      // Add CSS optimization plugins
      config.optimization = {
        ...config.optimization,
        // Enable tree shaking
        usedExports: true,
        sideEffects: false,
        // Optimize chunk splitting
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Vendor chunks for better caching
            vendor: {
              test: /[\/\\]node_modules[\/\\]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // React and React DOM in separate chunk
            react: {
              test: /[\/\\]node_modules[\/\\](react|react-dom)[\/\\]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
            // Radix UI components
            radix: {
              test: /[\/\\]node_modules[\/\\]@radix-ui[\/\\]/,
              name: 'radix',
              chunks: 'all',
              priority: 15,
            },
            // Charts library
            charts: {
              test: /[\/\\]node_modules[\/\\](recharts)[\/\\]/,
              name: 'charts',
              chunks: 'all',
              priority: 15,
            },
            // Date utilities
            dateUtils: {
              test: /[\/\\]node_modules[\/\\](date-fns)[\/\\]/,
              name: 'date-utils',
              chunks: 'all',
              priority: 15,
            },
            // Styles chunk
            styles: {
              name: 'styles',
              test: /\.(css|scss)$/,
              chunks: 'all',
              enforce: true,
            },
          },
        },
        // Minimize bundle size
        minimize: true,
      }
      
      // Add performance hints
      config.performance = {
        ...config.performance,
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      }
    }
    
    return config
  },
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/(.*).css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Bundle analyzer (optional, for development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      )
      return config
    },
  }),
}

export default nextConfig
