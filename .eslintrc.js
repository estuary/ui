module.exports = {
    extends: [
        'eslint-config-kentcdodds',
        'eslint-config-kentcdodds/jest',
        'eslint-config-kentcdodds/jsx-a11y',
        'eslint-config-kentcdodds/react',
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
    },
    rules: {
        // Helpful for dev... maybe make different settings for "final code"?
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',

        // Helpful for dev but probably should turn these on eventually
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',

        // We're using a new React so I think this is safe
        'react/react-in-jsx-scope': 'off',

        // Design decision we made for how we like code
        'react/destructuring-assignment': 'error',
    },
};
