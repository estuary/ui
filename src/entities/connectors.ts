import { client } from 'services/client';
import { BaseResponse } from 'types';

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

export interface ConnectorImageResponse {
    id: string;
    type: string;
    attributes: {
        connector_id: string;
        created_at: string;
        id: string;
        name: string;
        digest: string;
        tag: string;
        updated_at: string;
    };
    links: {
        connector: string;
        self: string;
        spec: string;
    };
}

export interface ConnectorImagesResponse extends BaseResponse {
    data: ConnectorImageResponse[];
    links: {
        self: string;
    };
}

export const connectorsEndpoint = {
    images: {
        read: (endpoint: ConnectorResponse['links']['images']) => {
            return client<ConnectorsResponse>(endpoint);
        },
    },
    read: () => {
        return client<ConnectorsResponse>('connectors');
    },
};
