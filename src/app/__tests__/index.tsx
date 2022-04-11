import '@testing-library/jest-dom';
import App from 'app';
import { customRender } from 'utils/test-utils';

describe('When there is no user', () => {
    test('the login page is displayed', async () => {
        const view = await customRender(<App />, {});

        expect(view).toMatchSnapshot();
    });
});
