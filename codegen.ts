import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema:
        process.env.GQL_URL ??
        'https://agent-api-1084703453822.us-central1.run.app/api/graphql',
    documents: ['src/**/*.tsx', 'src/**/*.ts'],
    ignoreNoDocuments: true,
    generates: {
        './schema.graphql': {
            plugins: ['schema-ast'],
        },
        './src/gql-types/': {
            preset: 'client',
            presetConfig: {
                fragmentMasking: false,
            },
            config: {
                enumsAsTypes: true,
            },
        },
    },
};

export default config;
