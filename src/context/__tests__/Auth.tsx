import { render, screen, waitFor } from '@testing-library/react';
import { sub } from 'date-fns';
import add from 'date-fns/add';
import formatISO from 'date-fns/formatISO';
import { type ReactElement } from 'react';
import { sessionStorageKey, userStorageKey } from 'services/auth';
import { AuthProvider, useAuth } from '../Auth';
import AppContent from '../Content';

const renderAuth = (ui: ReactElement) => {
    return render(<AppContent>{ui}</AppContent>);
};
const fakeUser = 'FooBar123';
const userMissing = 'No User Found';

const FakeComponent = () => {
    const { user } = useAuth();

    return user ? user : userMissing;
};

const setExpiresAt = (expires: string) => {
    window.localStorage.setItem(
        sessionStorageKey,
        JSON.stringify({
            expires_at: expires,
        })
    );
};

describe('if there is a user', () => {
    beforeAll(() => {
        window.localStorage.setItem(
            userStorageKey,
            JSON.stringify({
                display_name: fakeUser,
            })
        );
    });

    test('and the session isnt expired we use it', async () => {
        setExpiresAt(
            formatISO(
                add(new Date(), {
                    years: 1,
                })
            )
        );

        renderAuth(
            <AuthProvider>
                <FakeComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(fakeUser)).toBeInTheDocument();
        });
    });

    test('and the session is expired we ignore it', async () => {
        setExpiresAt(
            formatISO(
                sub(new Date(), {
                    years: 1,
                })
            )
        );

        renderAuth(
            <AuthProvider>
                <FakeComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(userMissing)).toBeInTheDocument();
        });
    });
});
