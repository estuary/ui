import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { customRender, logoutUser } from 'utils/test-utils';
import App from '..';

test('Unauthenticated app renders when no user is present', async () => {
    await customRender(<App />, {
        username: undefined,
    });

    await waitFor(() => {
        expect(
            screen.getByText('Please use one of the providrs below to continue')
        ).toBeInTheDocument();
    });
});

describe('When there is a user', () => {
    const fakeUserName = 'foo-username';

    test('Authenticated renders', async () => {
        await customRender(<App />, {
            username: fakeUserName,
        });

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: /Welcome to Flow/i,
                })
            ).toBeInTheDocument();
        });
    });

    test('Unauthenticated renders when they are logged out', async () => {
        await customRender(<App />, {
            username: fakeUserName,
        });

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: /Welcome to Flow/i,
                })
            ).toBeInTheDocument();
        });

        // Passing undefined below DOES NOT log the user out
        logoutUser();
        await customRender(<App />, {
            username: undefined,
        });

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please use one of the providrs below to continue.'
                )
            ).toBeInTheDocument();
        });
    });
});
