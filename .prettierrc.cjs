module.exports = {
    plugins: ['@ianvs/prettier-plugin-sort-imports'],
    arrowParens: 'always',
    bracketSameLine: false,
    bracketSpacing: true,
    embeddedLanguageFormatting: 'auto',
    insertPragma: false,
    jsxSingleQuote: false,
    printWidth: 80,
    proseWrap: 'preserve',
    quoteProps: 'consistent',
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
    useTabs: false,
    importOrderTypeScriptVersion: '4.9.4',
    importOrder: [
        '<TYPES>',
        '',
        '^(react/(.*)$)|^(react$)',
        '^(use-*|react-use/(.*)$)',
        '',
        '^(@mui/(.*)$)|^(@mui)',
        '',
        '^(@jsonforms/(.*)$)|^(@jsonforms)',
        '^(zustand/(.*)$)|^(zustand)',
        '',
        '<THIRD_PARTY_MODULES>',
        '',
        '^(src/(.*)$)|^(src)',
        '',
        '.(png|svg|css)$',
    ],
};