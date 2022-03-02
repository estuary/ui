module.exports = {
    '*.{js,jsx,ts,tsx,json}': [
        'prettier --write',
        'eslint --fix',
        () => 'tsc-files --noEmit',
        'react-app-rewired test --bail --watchAll=false --findRelatedTests --passWithNoTests',
    ],
};
