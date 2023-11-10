import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './build',
    },
    plugins: [
        checker({
            eslint: {
                // for example, lint .ts and .tsx
                lintCommand: 'lint',
            },
            typescript: true /** or an object config */,
        }),
        react(),
        viteTsconfigPaths(),
        svgr({
            include: '**/*.svg?react',
        }),
        topLevelAwait(),
        wasm(),
    ],
    server: {
        port: 3000,
    },
});
