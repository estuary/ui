import { client } from 'services/client';
import { BaseResponse } from 'types';
import { Account } from './account';

export interface AccountsResponse extends BaseResponse {
    data: Account[];
    links: {
        self: string;
    };
}

export const accountsEndpoint = {
    read: () => {
        return client<AccountsResponse>('accounts');
    },
};
