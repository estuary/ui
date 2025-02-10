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
import { type Plugin } from 'vite';
import path from 'path';
import { sri } from 'vite-plugin-sri3';

// TODO (vite) using require is deprecated. Need to switch to import before vite 6
const gitCommands = require('git-rev-sync');

const writeVersionToFile: () => Plugin = () => ({
    name: 'write-version-to-file',
    async config(config) {
        try {
            // Fetch details from git
            const commitId = gitCommands.long();
            const commitDate = gitCommands.date();

            // Make sure we got something
            if (!commitId || !commitDate) {
                console.error(`Failed to get details from git`, {
                    commitDate,
                    commitId,
                });
                return;
            }

            // Get the output ready
            const output = JSON.stringify({
                commitDate,
                commitId,
            });

            // Make sure the file is there
            const file = './public/meta.json';
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

            // Return back so the app can access this property
            return {
                define: {
                    ['__ESTUARY_UI_COMMIT_ID__']: JSON.stringify(commitId),
                    ['__ESTUARY_UI_COMMIT_DATE__']: JSON.stringify(commitDate),
                },
            };
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

    optimizeDeps: {
        include: ['@estuary/flow-web'],
        // exclude: ['@estuary/flow-web'],
    },

    preview: { port: 3000, strictPort: true },
    server: { port: 3000, strictPort: true },
    test: {
        clearMocks: true,
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.ts'],
        testTimeout: 10000, // more time for auto retries
        restoreMocks: true,
        deps: {
            inline: ['@estuary/flow-web'],
        },
        exclude: [
            '**/playwright-tests/**',

            // Below are defaults
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        ],
    },

    // https://github.com/vitejs/awesome-vite#plugins
    plugins: [
        viteTsconfigPaths(),

        // Code injection
        nodePolyfills({
            include: ['buffer', 'path', 'process', 'stream'],
        }),
        topLevelAwait(),

        // Deps
        react({
            jsxImportSource: '@emotion/react',
        }),
        wasm(),

        // Build/Deploy stuff
        writeVersionToFile(),
        viteImageOptimizer({}),
        sri(), // make sure this is before compression
        compression({
            algorithm: 'gzip',
            exclude: /\.(br|gz)$/i,
            include: /\.(js|mjs|json|css|html|wasm)$/i,
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
    ],
});
