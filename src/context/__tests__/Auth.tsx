import { render, screen, waitFor } from '@testing-library/react';
import { getUnixTime, sub } from 'date-fns';
import add from 'date-fns/add';
import { type ReactElement } from 'react';
import { loginAsUser, updateAuthToken } from 'utils/test-utils';
import { AuthProvider, useAuth } from '../Auth';
import AppContent from '../Content';

const renderAuth = (ui: ReactElement) => {
    return render(<AppContent>{ui}</AppContent>);
};
const fakeUser = 'FooBar123';
const userMissing = 'No User Found';

const FakeComponent = () => {
    const { user } = useAuth();

    if (user) {
        return <>Your name is {user.ext.displayName}</>;
    } else {
        return <>You have no name because {userMissing}</>;
    }
};

describe('if there is a user', () => {
    beforeAll(() => {
        loginAsUser(fakeUser);
    });

    test('and the session isnt expired we use it', async () => {
        updateAuthToken({
            expires: getUnixTime(
                add(new Date(), {
                    years: 1,
                })
            ),
        });

        renderAuth(
            <AuthProvider>
                <FakeComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(
                screen.getByText(fakeUser, { exact: false })
            ).toBeInTheDocument();
        });
    });

    test('and the session is expired we ignore it', async () => {
        updateAuthToken({
            expires: getUnixTime(
                sub(new Date(), {
                    years: 1,
                })
            ),
        });

        renderAuth(
            <AuthProvider>
                <FakeComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(
                screen.getByText(userMissing, { exact: false })
            ).toBeInTheDocument();
        });
    });
});
