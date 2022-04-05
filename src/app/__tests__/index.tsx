import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { customRender } from 'utils/test-utils';
import App from '..';

test('Unauthenticated app renders when no user is present', async () => {
    await customRender(<App />, {
        username: undefined,
    });

    await waitFor(() => {
        expect(
            screen.getByText(
                'Please use one of the providers below to continue.'
            )
        ).toBeInTheDocument();
    });
});
