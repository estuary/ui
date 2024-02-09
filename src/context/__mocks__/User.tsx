import { createClient, User } from '@supabase/supabase-js';
import { mock, mockDeep } from 'vitest-mock-extended';
import { Auth } from '@supabase/ui';
import { AuthSession } from '@supabase/ui/dist/cjs/components/Auth/UserContext';
import { SwrSupabaseContext } from 'hooks/supabase-swr';
import { generateMockUserMetadata } from 'test/test-utils';
import { BaseComponentProps } from 'types';
import { SUPABASE_URL } from 'test/shared';

function User({ children }: BaseComponentProps) {
    console.log('user mock');

    const mockClient = createClient(SUPABASE_URL, 'MockSupabaseAnonKey');
    const mockAuthSession = mockDeep<AuthSession>();

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
