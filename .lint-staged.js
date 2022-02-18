module.exports = {
    '*.{js,jsx,ts,tsx,json}': [
        'prettier',
        'eslint',
        () => 'tsc-files --noEmit',
        'react-app-rewired test --bail --watchAll=false --findRelatedTests --passWithNoTests',
    ],
};
