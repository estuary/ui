import { defineConfig } from 'vitest/config';
import fs from 'fs/promises';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { compression } from 'vite-plugin-compression2';
import { ViteImageOptimizer as viteImageOptimizer } from 'vite-plugin-image-optimizer';
import circleDependency from 'vite-plugin-circular-dependency';
import { vitePluginVersionMark } from 'vite-plugin-version-mark';
import { type Plugin } from 'vite';
import path from 'path';

const APP_VERSION = '__ESTUARY_UI_VERSION__';

const writeVersionToFile: () => Plugin = () => ({
    name: 'write-version-to-file',
    async config(config) {
        const version = config.define?.[APP_VERSION]?.replaceAll(`"`, '');
        if (!version) {
            console.error(`${APP_VERSION} not found`);
            return;
        }

        try {
            // get version in vitePlugin if you open `ifGlobal`
            const output = JSON.stringify({
                version,
            });
            const file = './public/meta.json';

            // Make sure the file is there
            await fs
                .access(path.dirname(file))
                .catch(() => fs.mkdir(path.dirname(file), { recursive: true }));

            // Write content to file
            await fs
                .writeFile(file, output)
                .then(() => {
                    console.log(`Wrote ${output} to ${file}`);
                })
                .catch((err) => {
                    console.error(err);
                });
        } catch (err) {
            console.error(err);
        }
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        assetsDir: 'static',
        outDir: './build',
    },

    define: {
        [APP_VERSION]: JSON.stringify(process.env.npm_package_version),
    },

    preview: { port: 3000, strictPort: true },
    server: { port: 3000, strictPort: true },
    test: {
        environment: 'jsdom',
        setupFiles: './test-setup.js',
    },

    // https://github.com/vitejs/awesome-vite#plugins
    plugins: [
        viteTsconfigPaths(),
        // vitePluginVersionMark({
        //     ifGitSHA: false,
        //     ifMeta: false,
        //     ifGlobal: true,
        //     ifLog: true,
        // }),

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
        compression({
            algorithm: 'gzip',
            exclude: [/\.(br)$/, /\.(gz)$/],
            deleteOriginalAssets: false,
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
        writeVersionToFile(),
    ],
});
