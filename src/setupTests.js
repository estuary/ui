// Tried to follow the steps in the CRA docs
//    https://create-react-app.dev/docs/running-tests/
//
import '@testing-library/jest-dom';

// React Intl setup for testing
//    https://testing-library.com/docs/example-react-intl/
//
const hasFullICU = () => {
    try {
        const january = new Date(9e8);
        const pt = new Intl.DateTimeFormat('pt', { month: 'long' });
        return pt.format(january) === 'janeiro';
    } catch (err) {
        return false;
    }
};

export const setupTests = () => {
    if (hasFullICU()) {
        Intl.NumberFormat.format = new Intl.NumberFormat('pt').format;
        Intl.DateTimeFormat.format = new Intl.DateTimeFormat('pt').format;
    }
};
