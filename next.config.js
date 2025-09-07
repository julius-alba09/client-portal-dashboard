/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for performance
  experimental: {
    // Server components and app directory (already enabled)
    appDir: true,
    
    // Enable Turbopack for faster builds
    turbo: {
      rules: {
        // Optimize CSS processing
        '*.css': {
          loaders: ['css-loader'],
          as: '*.css',
        },
        // Optimize image processing
        '*.{png,jpg,jpeg,gif,webp,avif,ico,bmp,svg}': {
          loaders: ['file-loader'],
          as: '*.{png,jpg,jpeg,gif,webp,avif,ico,bmp,svg}',
        },
      },
    },
    
    // Enable edge runtime for faster cold starts
    runtime: 'edge',
    
    // Optimize JavaScript parsing
    swcMinify: true,
    swcPlugins: [],
    
    // Enable concurrent features
    concurrentFeatures: true,
    
    // Optimize bundle size
    optimizeCss: true,
    
    // Enable modern output
    outputStandalone: true,
  },

  // Production optimizations
  swcMinify: true,
  
  // Enable static optimization
  output: 'standalone',
  
  // Optimize images
  images: {
    // Enable modern formats
    formats: ['image/avif', 'image/webp'],
    
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Enable image optimization
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // External domains (add your image domains)
    domains: [
      'images.unsplash.com',
      'ui-avatars.com',
      // Add other image domains as needed
    ],
    
    // Enable placeholder blur
    placeholder: 'blur',
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Optimize chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };

      // Enable compression
      config.optimization.minimize = true;
    }

    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      // Reduce bundle size by aliasing to smaller versions
      'lodash': 'lodash-es',
    };

    // Bundle analyzer (uncomment for analysis)
    // if (!isServer && !dev) {
    //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    //   config.plugins.push(
    //     new BundleAnalyzerPlugin({
    //       analyzerMode: 'static',
    //       openAnalyzer: false,
    //       reportFilename: './bundle-analysis.html',
    //     })
    //   );
    // }

    return config;
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Enable compression
  compress: true,
  
  // Optimize fonts
  optimizeFonts: true,
  
  // Enable static generation where possible
  trailingSlash: false,
  
  // Redirect optimizations
  async redirects() {
    return [];
  },

  // Rewrite optimizations
  async rewrites() {
    return [];
  },

  // Environment variables (public ones)
  env: {
    CUSTOM_KEY: 'ultra-fast-app',
  },

  // TypeScript configuration
  typescript: {
    // Enable faster builds by skipping type checking during build
    // (run type checking separately in CI/CD)
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Enable faster builds by skipping linting during build
    // (run linting separately in CI/CD)
    ignoreDuringBuilds: false,
  },

  // Power optimization for serverless
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Enable modern JavaScript
  future: {
    webpack5: true,
  },
};

module.exports = nextConfig;
