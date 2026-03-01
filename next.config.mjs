
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ["node-ical"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lfwpymqsqyuqevwuujkx.supabase.co",
        pathname: "/storage/v1/object/public/images/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/stories/media/:filename",
        destination: "/images/stories/media/:filename",
      },
    ];
  },
};

export default nextConfig;
