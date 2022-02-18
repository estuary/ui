module.exports = {
    '*.{js,jsx,ts,tsx,json}': [
        'npm run format',
        'eslint',
        () => 'tsc-files --noEmit',
        'react-app-rewired test --bail --watchAll=false --findRelatedTests --passWithNoTests',
    ],
};
