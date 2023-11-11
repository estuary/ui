import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vitePluginHtmlEnv from 'vite-plugin-html-env';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer as viteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './build',
    },

    preview: { open: true, port: 3000, strictPort: true },
    server: { open: true, port: 3000, strictPort: true },

    // https://github.com/vitejs/awesome-vite#plugins
    plugins: [
        checker({
            eslint: {
                lintCommand: 'lint',
            },
            typescript: {
                tsconfigPath: './tsconfig.json',
            },
        }),
        nodePolyfills({
            include: ['path', 'process', 'stream'],
        }),
        react(),
        topLevelAwait(),
        viteCompression(),
        viteImageOptimizer({}),
        vitePluginHtmlEnv({
            compiler: true,
        }),
        viteTsconfigPaths(),
        wasm(),
    ],
});
