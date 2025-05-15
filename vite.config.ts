import ChildProcess from 'child_process';
import { readFileSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import license from 'rollup-plugin-license';
import { type Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import circleDependency from 'vite-plugin-circular-dependency';
import { compression } from 'vite-plugin-compression2';
import { ViteImageOptimizer as viteImageOptimizer } from 'vite-plugin-image-optimizer';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { sri } from 'vite-plugin-sri3';
import wasm from 'vite-plugin-wasm';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const gitFolder = '.git/';

const cleanFileRead = (path: string) => readFileSync(path).toString().trim();

const getCommitId = () => {
    const headRef = cleanFileRead(`${gitFolder}HEAD`);

    if (headRef.indexOf(':') === -1) {
        return headRef;
    } else {
        return cleanFileRead(`${gitFolder}${headRef.substring(5)}`);
    }
};

function getCommitHash() {
    try {
        // Try local branch first
        return ChildProcess.execSync('git rev-parse HEAD').toString().trim();
    } catch {
        return null;
    }
}

const writeVersionToFile: () => Plugin = () => ({
    name: 'write-version-to-file',
    async config(config) {
        try {
            const commitId = getCommitHash();

            // Make sure we got something
            if (!commitId) {
                console.error(`Failed to get details from git`, {
                    commitId,
                });
                return;
            }

            // Store off when we did the build (not used right now)
            const builtAt = new Date();

            // Get the output ready
            const output = JSON.stringify({
                builtAt,
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
                    ['__ESTUARY_UI_COMMIT_DATE__']: JSON.stringify(builtAt),
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
        target: browserslistToEsbuild(),
        rollupOptions: {
            plugins: [
                license({
                    sourcemap: true,
                    thirdParty: {
                        output: {
                            // Output file into public directory which is included in the build output.
                            file: './public/vendor.license.txt',
                        },
                    },
                }),
            ],
        },
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
