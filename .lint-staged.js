module.exports = {
    '*.{js,jsx,ts,tsx}': [
        'npm run format',
        'npm run lint --max-errors=0',
        'react-app-rewired test --bail --watchAll=false --findRelatedTests --passWithNoTests',
        () => 'tsc-files --noEmit',
    ],
    '*.{js,jsx,ts,tsx,json}': ['prettier --write'],
};
