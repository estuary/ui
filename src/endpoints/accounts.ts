import { client } from 'services/client';
import { BaseResponse } from 'types';
import { AccountResponse } from './account';

export interface AccountsResponse extends BaseResponse {
    data: AccountResponse['data'][];
    links: {
        self: string;
    };
}

export const accountsEndpoint = {
    read: () => {
        return client<AccountsResponse>('accounts');
    },
};
