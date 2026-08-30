/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals.push('socket.io-client');
    return config;
  },
};

module.exports = nextConfig;
