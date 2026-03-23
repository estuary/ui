import { loadEnvFile } from 'node:process';
import type { CodegenConfig } from '@graphql-codegen/cli';

loadEnvFile(process.env.LOCAL ? '.env.development.local' : '.env');

const config: CodegenConfig = {
    schema: process.env.VITE_GQL_URL,
    documents: 'src/**/*.{ts,tsx}',
    generates: {
        './src/gql-types/schema.graphql': {
            plugins: ['schema-ast'], // converts the json response from introspection query to a .graphql file
        },
        './src/gql-types/': {
            preset: 'client',
            presetConfig: {
                // fragmentMasking hides fields outside of the component that defines the fragment
                // - turning off is easier to work with, and it doesn't matter because we're not using any fragments yet
                fragmentMasking: false,
            },
            config: {
                // generates string unions instead of enums
                enumsAsTypes: true,
            },
        },
    },
};

export default config;
