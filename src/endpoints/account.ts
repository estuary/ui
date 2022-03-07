import { BaseResponse } from 'types';
import { client } from './client';
import { SessionLocalResponse } from './session';

export interface AccountResponse extends BaseResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            created_at: string;
            display_name: string;
            email: string;
            id: string;
            name: string;
            unique_name: string;
            updated_at: string;
        };
        links: {
            self: string;
        };
    };
}

export const accountEndpoint = {
    read: (endpoint: SessionLocalResponse['links']['account']) => {
        return client<AccountResponse>(endpoint);
    },
};
