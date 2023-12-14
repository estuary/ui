import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer as viteImageOptimizer } from 'vite-plugin-image-optimizer';
import circleDependency from 'vite-plugin-circular-dependency';
import { vitePluginVersionMark } from 'vite-plugin-version-mark';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './build',
    },

    preview: { port: 3000, strictPort: true },
    server: { port: 3000, strictPort: true },

    // https://github.com/vitejs/awesome-vite#plugins
    plugins: [
        viteTsconfigPaths(),

        // Code injection
        nodePolyfills({
            include: ['path', 'process', 'stream'],
        }),
        topLevelAwait(),

        // Deps
        react(),
        wasm(),

        // Build/Deploy stuff
        viteImageOptimizer({}),
        viteCompression(),
        vitePluginVersionMark({
            ifGitSHA: true,
            ifMeta: false,
            ifGlobal: true,
            ifLog: true,
        }),

        // Quality Control
        checker({
            eslint: {
                lintCommand: 'lint',
            },
            typescript: {
                tsconfigPath: './tsconfig.json',
            },
        }),
        circleDependency({}),
    ],
    test: {
        environment: 'jsdom',
        setupFiles: './test-setup.js',
    },
});
