import { AuthSession, Session, User } from '@supabase/supabase-js';
import { Auth } from '@supabase/ui';
import { RenderOptions, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppProviders from 'context';
import ThemeProvider from 'context/Theme';
import { SwrSupabaseContext } from 'hooks/supabase-swr';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { supabaseClient } from 'services/supabase';
import { ResourceConfig } from 'stores/Binding/types';
import { mockDeep } from 'vitest-mock-extended';
import { ConnectorConfig } from '../../flow_deps/flow';

export const generateMockUserMetadata = (
    username: string
): User['user_metadata'] => {
    return mockDeep<User['user_metadata']>({
        avatar_url: `https://example.org/avatar/${username}`,
        email: `${username}@example.org`,
        email_verified: true,
        full_name: `Full ${username}`,
        iss: 'https://api.example.org',
        name: username,
        picture: `https://example.org/picture/${username}`,
        preferred_username: username,
        provider_id: '00000000000000000000_provider',
        sub: '00000000000000000000_sub',
        user_name: username,
    });
};

export const generateMockUser = (username: string): User => {
    return mockDeep<User>({
        email: `${username}@example.org`,
        user_metadata: generateMockUserMetadata(username),
    });
};

export const generateMockSession = (username: string): Session => {
    return mockDeep<Session>({
        access_token: `${username}___mock_access_token`,
        user: generateMockUser(username),
    });
};

export const generateMockConnectorConfig = (): ConnectorConfig => {
    return mockDeep<ConnectorConfig>({
        image: 'example.com/materialize-postgres:mock',
        config: {
            address: '0.0.0.0:9999',
            database: 'data/base/path',
            password_sops: 'ENC[AES256_GCM,data:foo,tag:bar,type:str]',
            schema: 'public',
            user: 'testing',
            sops: {},
        },
    });
};

export const generateMockResourceConfig = (
    collectionName: string,
    bindingIndex: number
): ResourceConfig => {
    return mockDeep<ResourceConfig>({
        data: {
            fiz: 'resource',
        },
        errors: [],
        meta: {
            collectionName,
            bindingIndex,
            disable: false,
            previouslyDisabled: false,
        },
    });
};

export interface AllTheProvidersProps {
    children: ReactElement;
}
export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
    return (
        <AppProviders>
            <BrowserRouter>{children}</BrowserRouter>
        </AppProviders>
    );
};

export const renderOps: RenderOptions = {
    wrapper: AllTheProviders,
};

// Below are all in progress and not working
// TODO (testing) still working out how we'll render views
const goTo = (route?: string, name?: string) => {
    window.history.pushState(
        {},
        name ? name : 'Test page',
        route ? route : '/'
    );
};

const MockProviders = ({ children, username }: any) => {
    const mockAuthSession = mockDeep<AuthSession>();

    if (username) {
        mockAuthSession.user = mockDeep<User>();
        mockAuthSession.user.user_metadata = generateMockUserMetadata(username);
        Auth.useUser = () => mockAuthSession as any;
    }

    return (
        <SwrSupabaseContext.Provider value={supabaseClient}>
            <Auth.UserContextProvider supabaseClient={supabaseClient}>
                {children}
            </Auth.UserContextProvider>
        </SwrSupabaseContext.Provider>
    );
};

export const customRender = async (
    ui: ReactElement,
    options: Omit<RenderOptions, 'wrapper'> & {
        route?: string;
        username?: string;
    }
) => {
    const { route, username } = options;

    const view = render(
        <AppProviders>
            <MockProviders username={username}>
                <ThemeProvider>
                    <BrowserRouter>{ui}</BrowserRouter>
                </ThemeProvider>
            </MockProviders>
        </AppProviders>,
        {
            ...options,
        }
    );

    goTo(route, 'Test Page');

    return {
        user: userEvent.setup(),
        view,
    };
};
