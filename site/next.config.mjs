/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repoName = "my-career";

// In production, public assets and internal links need the repo path prefix
// because GitHub Pages serves the site from /<repo>/. In dev the prefix is
// empty so paths like /photo.jfif still work.
const basePath = isProd ? `/${repoName}` : "";

process.env.NEXT_PUBLIC_BASE_PATH = basePath;

const nextConfig = {
  reactStrictMode: true,
  // `output: "export"` triggers a validation that requires `generateStaticParams`
  // for dynamic routes, but reads the prerender manifest which is only populated
  // during `next build`. In `next dev` the manifest is empty, so the validation
  // throws a false-positive "missing generateStaticParams" error. Enable export
  // only for production builds; dev runs in normal SSR mode.
  ...(isProd ? { output: "export" } : {}),
  // We use next/font (no <Image>) so unoptimized images aren't required,
  // but set it anyway in case anything reaches for it.
  images: { unoptimized: true },
  basePath,
  // Static export serves trailing-slash URLs (GitHub Pages serves /about.html as /about/).
  trailingSlash: true,
};

export default nextConfig;
