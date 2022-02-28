import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { customRender, logoutUser } from 'utils/test-utils';
import App from '.';

test('Unauthenticated app renders when no user is present', async () => {
    await customRender(<App />, {
        user: undefined,
    });

    await waitFor(() => {
        expect(
            screen.getByText(
                'When running locally you can login with whatever name you want.'
            )
        ).toBeInTheDocument();
    });
});

test('Authenticated renders with user', async () => {
    await customRender(<App />, {
        user: 'FooBar123',
    });

    await waitFor(() => {
        expect(
            screen.getByRole('heading', { name: /Welcome to Control Plane/i })
        ).toBeInTheDocument();
    });
});

test('Unauthenticated renders with user is logged out', async () => {
    await customRender(<App />, {
        user: 'FooBar123',
    });

    await waitFor(() => {
        expect(
            screen.getByRole('heading', { name: /Welcome to Control Plane/i })
        ).toBeInTheDocument();
    });

    // Passing undefined below DOES NOT log the user out
    logoutUser();
    await customRender(<App />, {
        user: undefined,
    });

    await waitFor(() => {
        expect(
            screen.getByText(
                'When running locally you can login with whatever name you want.'
            )
        ).toBeInTheDocument();
    });
});
