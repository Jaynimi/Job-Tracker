import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Make sure this is false
  },
};

export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   typescript: {
//     ignoreBuildErrors: false, // Good - forces type checking
//   },
//   eslint: {
//     ignoreDuringBuilds: false, // Ensures ESLint runs during build
//   },
//   // Recommended for Firebase compatibility
//   images: {
//     domains: ['lh3.googleusercontent.com'], // If using Firebase Auth profile images
//   },
//   // Important for API routes
//   experimental: {
//     typedRoutes: true, // Enables stricter route type checking
//   },
//   // If using Clerk middleware
//   async headers() {
//     return [
//       {
//         source: '/:path*',
//         headers: [
//           {
//             key: 'Cross-Origin-Opener-Policy',
//             value: 'same-origin'
//           },
//           {
//             key: 'Cross-Origin-Embedder-Policy',
//             value: 'require-corp'
//           }
//         ]
//       }
//     ]
//   }
// };

// export default nextConfig;
