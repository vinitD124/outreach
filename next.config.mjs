/** @type {import('next').NextConfig} */
const nextConfig = {
  // Both demo templates are read off disk at request time. Vercel only
  // ships files the build traced into the function, and a file living
  // under public/ is normally treated as a CDN asset rather than
  // something the server reads - so name them explicitly. Only the HTML
  // is listed: css/, js/ and image/ are fetched by the browser from the
  // CDN and have no business inside the function bundle.
  outputFileTracingIncludes: {
    '/[slug]': ['./index.html', './public/micare/index.html'],
    '/admin/preview/[template]': ['./index.html', './public/micare/index.html'],
  },

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
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
