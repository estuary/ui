module.exports = {
    '*.{js,jsx,ts,tsx,json}': [
        'npm run format',
        'npm run lint:fix --max-errors=0',
        () => 'tsc-files --noEmit',
        'react-app-rewired test --bail --watchAll=false --findRelatedTests --passWithNoTests',
    ],
};
