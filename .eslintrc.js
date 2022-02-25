module.exports = {
    extends: [
        'eslint-config-kentcdodds',
        'eslint-config-kentcdodds/jest',
        'eslint-config-kentcdodds/jsx-a11y',
        'eslint-config-kentcdodds/react',
    ],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    plugins: ['sort-keys-fix'],
    rules: {
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

        // We're using a new React so I think this is safe
        'react/react-in-jsx-scope': 'off',

        // Misc
        'sort-keys-fix/sort-keys-fix': [
            'error',
            'asc',
            { caseSensitive: true, natural: true },
        ],
    },
};
