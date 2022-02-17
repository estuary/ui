module.exports = {
    '*.{js,jsx,ts,tsx,json}': [
        'npm run format',
        'npm run lint --max-errors=0',
        'react-app-rewired test --bail --watchAll=false --findRelatedTests --passWithNoTests',
        () => 'tsc-files --noEmit',
    ],
};
