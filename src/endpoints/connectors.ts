import { client } from 'services/client';
import { BaseResponse } from 'types';

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

export interface ConnectorImagesSpecResponse {
    data: {
        attributes: {
            type: string;
            documentationURL: string;
            endpointSpecSchema: any;
            resourceSpecSchema: any;
        };
        links: {
            connector: string;
            discovery: string;
            image: string;
            self: string;
        };
    };
}

export const connectorsEndpoint = {
    images: {
        read: (endpoint: ConnectorResponse['links']['images']) => {
            return client<ConnectorsResponse>(endpoint);
        },
        spec: {
            read: (endpoint: ConnectorImageResponse['links']['spec']) => {
                return client<ConnectorImagesSpecResponse>(endpoint);
            },
        },
    },
    read: () => {
        return client<ConnectorsResponse>('connectors');
    },
};
