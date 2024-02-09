import { createClient, User } from '@supabase/supabase-js';
import { mock, mockDeep } from 'vitest-mock-extended';
import { Auth } from '@supabase/ui';
import { AuthSession } from '@supabase/ui/dist/cjs/components/Auth/UserContext';
import { SwrSupabaseContext } from 'hooks/supabase-swr';
import { generateMockUserMetadata } from 'test/test-utils';
import { BaseComponentProps } from 'types';

function User({ children }: BaseComponentProps) {
    console.log('User Mock');
    const mockClient = createClient('http://mock.url', 'MockSupabaseAnonKey');
    const mockAuthSession = mockDeep<AuthSession>();

    console.log('mockAuthSession', mockAuthSession);

    mockAuthSession.user = mock<User>();
    mockAuthSession.user.user_metadata = generateMockUserMetadata('Alice Bob');
    Auth.useUser = () => mockAuthSession;

    return (
        <SwrSupabaseContext.Provider value={mockClient}>
            <Auth.UserContextProvider supabaseClient={mockClient}>
                {children}
            </Auth.UserContextProvider>
        </SwrSupabaseContext.Provider>
    );
}

export default User;
