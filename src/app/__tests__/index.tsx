/* eslint-disable jest/no-commented-out-tests */
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

// Disabling right now as we might change how access grants are fetched before trying to fix this
// describe('When there is a user', () => {
//     let username: string;

//     beforeEach(() => {
//         username = 'foo123';
//     });

//     test('we check if there are access grants', async () => {
//         await customRender(<App />, {
//             username,
//         });

//         await waitFor(() => {
//             expect(
//                 screen.getByText(
//                     'Thanks for signing up. Our team is reviewing your account and will get back to you shortly.'
//                 )
//             ).toBeInTheDocument();
//         });
//     });
// });
