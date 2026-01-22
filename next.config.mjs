
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
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
