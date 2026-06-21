const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  basePath: isGithubPages ? "/baro-braille" : "",
  assetPrefix: isGithubPages ? "/baro-braille/" : ""
};

export default nextConfig;
