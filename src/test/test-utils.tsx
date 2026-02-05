import type { AuthSession, Session, User } from '@supabase/supabase-js';
import type { RenderOptions } from '@testing-library/react';
import type { ConnectorConfig } from 'deps/flow/flow';
import type { ReactElement } from 'react';
import type { ResourceConfig } from 'src/stores/Binding/types';
import type { Entity, Schema } from 'src/types';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { mockDeep } from 'vitest-mock-extended';

import AppProviders from 'src/context';
import ThemeProvider from 'src/context/Theme';

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

export const generateMockBinding = (
    collectionName: string,
    entityType: Entity,
    options?: { resourceConfig?: Schema }
): Schema => {
    const collectionNameProp =
        entityType === 'materialization' ? 'source' : 'target';

    return mockDeep<Schema>({
        resource: options?.resourceConfig ?? {
            fiz: 'resource',
        },
        [collectionNameProp]: collectionName,
        fields: {
            recommended: true,
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
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
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
