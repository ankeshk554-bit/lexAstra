/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/pdf-worker': ['./node_modules/pdfjs-dist/build/pdf.worker.min.mjs'],
  },
};
export default nextConfig;
