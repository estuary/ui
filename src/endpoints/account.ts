import { SessionLocalLinks } from 'endpoints/session';
import { client } from 'services/client';
import { BaseLinks, BaseResponse } from 'types';

export interface AccountAttributes {
    created_at: string;
    display_name: string;
    email: string;
    id: string;
    name: string;
    unique_name: string;
    updated_at: string;
}

export interface Account {
    id: string;
    type: string;
    attributes: AccountAttributes;
    links: BaseLinks;
}

export interface AccountResponse extends BaseResponse {
    data: Account;
}

export const accountEndpoint = {
    read: (endpoint: SessionLocalLinks['account']) => {
        return client<AccountResponse>(endpoint);
    },
};
