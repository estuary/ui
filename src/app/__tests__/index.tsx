import '@testing-library/jest-dom';
import App from 'app';
import { customRender, screen, waitFor } from 'utils/test-utils';

describe('When there is no user', () => {
    test('the login page is displayed', async () => {
        await customRender(<App />, {});

        await waitFor(() => {
            expect(
                screen.getByText('Sign in to continue to Estuary Flow.')
            ).toBeInTheDocument();
        });
    });
});

describe('When there is a user', () => {
    let username: string;

    beforeEach(() => {
        username = 'foo123';
    });

    test('the authorized app is logged into', async () => {
        await customRender(<App />, {
            username,
        });

        await waitFor(() => {
            expect(screen.getByText('Welcome to Flow!')).toBeInTheDocument();
        });
    });
});
