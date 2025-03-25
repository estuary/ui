module.exports = {
    extends: [
        'eslint-config-kentcdodds',
        'eslint-config-kentcdodds/jsx-a11y',
        'eslint-config-kentcdodds/react',
    ],
    ignorePatterns: ['vite.config.ts', '__mocks__', 'playwright-tests/'],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    plugins: ['formatjs', 'unused-imports', 'import'],
    rules: {
        // Want to make sure imports and exports are always formatted correctly
        'unused-imports/no-unused-imports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',

        'import/order': [
            'error',
            {
                groups: [
                    'type',
                    // Default sort order
                    ['builtin', 'external', 'parent', 'sibling', 'index'],
                    'internal',
                    'object',
                ],
            },
        ],

        // Only turning off right now to see more actual issues
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',

        // Helpful for dev but probably should turn these on eventually
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',

        // Helpful for dev... maybe make different settings for "final code"?
        'no-console': 'off',

        // Design decision we made for how we like code
        'react/destructuring-assignment': 'error',
        'no-tabs': 'error',

        // We're using a new React so I think this is safe
        'react/react-in-jsx-scope': 'off',

        // Just do not agree with this one
        'no-negated-condition': 'off',

        'formatjs/enforce-placeholders': 'error',
        // 'formatjs/no-literal-string-in-jsx': 'error',

        'react/iframe-missing-sandbox': 'error',
        'react/jsx-no-leaked-render': 'error',
        'no-constant-binary-expression': 'error',

        // We should never have these unless commented and explained
        'react-hooks/exhaustive-deps': 'error',

        // These really help with managing circular deps that don't matter
        '@typescript-eslint/consistent-type-imports': 'error',

        // Original LoadingButton can cause issues with Google Translate
        //  https://github.com/mui/material-ui/issues/27853
        //  https://github.com/facebook/react/issues/11538
        'no-restricted-imports': [
            'error',
            {
                name: '@mui/lab',
                importNames: ['LoadingButton'],
                message: 'Please use SafeLoadingButton instead.',
            },
            {
                name: '@emotion/react',
                message: 'Do not access emotion directly. Load through MUI',
            },
            {
                name: '@supabase/supabase-js',
                importNames: ['PostgrestResponse'],
                message: 'Please use @supabase/postgrest-js',
            },
        ],
    },
};
