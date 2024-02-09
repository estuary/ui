import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RenderOptions } from '@testing-library/react';
import AppProviders from 'context';
import produce from 'immer';
import { User } from '@supabase/supabase-js';
import { mock } from 'vitest-mock-extended';

export const generateMockUserMetadata = (username: string) => {
    return produce(mock<User['user_metadata']>(), (draft) => {
        draft.avatar_url = `https://example.org/avatar/${username}`;
        draft.email = `${username}@example.org`;
        draft.email_verified = true;
        draft.full_name = `Full ${username}`;
        draft.iss = 'https://api.example.org';
        draft.name = username;
        draft.picture = `https://example.org/picture/${username}`;
        draft.preferred_username = username;
        draft.provider_id = '00000000000000000000_provider';
        draft.sub = '00000000000000000000_sub';
        draft.user_name = username;

        return draft;
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
