import { BaseResponse } from 'types';
import { client } from './client';

export interface ConnectorsResponse extends BaseResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            created_at: string;
            description: string;
            id: string;
            name: string;
            maintainer: string;
            type: string;
            updated_at: string;
        };
        links: {
            images: string;
            self: string;
        };
    }[];
    links: {
        self: string;
    };
}

export const connectorsEndpoint = {
    read: () => {
        return client<ConnectorsResponse>('connectors');
    },
};
