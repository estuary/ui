import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RenderOptions } from '@testing-library/react';
import AppProviders from 'context';
import { Session, User } from '@supabase/supabase-js';
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
