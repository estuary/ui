import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vitePluginHtmlEnv from 'vite-plugin-html-env';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './build',
    },
    server: {
        port: 3000,
    },
    plugins: [
        checker({
            eslint: {
                // for example, lint .ts and .tsx
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
        svgr({ include: '**/*.svg?react' }),
        topLevelAwait(),
        vitePluginHtmlEnv({
            compiler: true,
            // compiler: false // old
        }),
        viteTsconfigPaths(),
        wasm(),
    ],
});
