import { loadEnvFile } from 'node:process';
import type { CodegenConfig } from '@graphql-codegen/cli';
import type { Types } from '@graphql-codegen/plugin-helpers';
import type { IntrospectionOptions } from 'graphql';

loadEnvFile(process.env.LOCAL ? '.env.development.local' : '.env');

const config: CodegenConfig = {
    schema: [
        {
            [process.env.VITE_GQL_URL as string]: {
                inputValueDeprecation: true,
            } satisfies Partial<IntrospectionOptions> as Types.UrlSchemaOptions,
        },
    ],
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
                // custom scalars that serialize as strings on the wire;
                // JSON/JSONObject intentionally stay `any`
                scalars: {
                    Collection: 'string',
                    DateTime: 'string',
                    Id: 'string',
                    NaiveDate: 'string',
                    Name: 'string',
                    Prefix: 'string',
                    Url: 'string',
                    UUID: 'string',
                },
            },
        },
    },
};

export default config;
