import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const cropHealthBase = String(env.VITE_CROP_HEALTH_BASE_URL || 'https://crop.kindwise.com/api/v1').trim().replace(/\/+$/, '');
  const cropHealthUrl = new URL(cropHealthBase);
  const cropHealthPath = cropHealthUrl.pathname.replace(/\/+$/, '');
  if (!env.CROP_HEALTH_API_KEY) console.warn('CROP_HEALTH_API_KEY is missing in .env.local');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/crop-health': {
          target: cropHealthUrl.origin,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/crop-health/, cropHealthPath),
          configure: proxy => proxy.on('proxyReq', proxyReq => {
            if (env.CROP_HEALTH_API_KEY) proxyReq.setHeader('Api-Key', env.CROP_HEALTH_API_KEY);
          }),
        },
      },
    },
  };
});
