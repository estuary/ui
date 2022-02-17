module.exports = {
    '*.{js,jsx,ts,tsx,json}': [
        'npm run format',
        'npm run lint --max-errors=0',
        'npm run typecheck',
        'react-app-rewired test --bail --watchAll=false --findRelatedTests --passWithNoTests',
    ],
};
