import { BaseResponse } from 'types';
import { client } from './client';

// TODO - this is here as I think eventually we'll have a stand alone Connector
interface ConnectorResponse {
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
}

export interface ConnectorsResponse extends BaseResponse {
    data: ConnectorResponse[];
    links: {
        self: string;
    };
}

export const connectorsEndpoint = {
    read: () => {
        return client<ConnectorsResponse>('connectors');
    },
};
