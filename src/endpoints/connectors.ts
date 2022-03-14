import { client } from 'services/client';
import { BaseResponse } from 'types';

interface ConnectorAttributes {
    created_at: string;
    description: string;
    id: string;
    name: string;
    maintainer: string;
    type: string;
    updated_at: string;
}

interface ConnectorLinks {
    images: string;
    self: string;
}

export interface Connector {
    id: string;
    type: string;
    attributes: ConnectorAttributes;
    links: ConnectorLinks;
}

export interface ConnectorsResponse extends BaseResponse {
    data: Connector[];
    links: {
        self: string;
    };
}

export interface ConnectorImageAttributes {
    connector_id: string;
    created_at: string;
    id: string;
    name: string;
    digest: string;
    tag: string;
    updated_at: string;
}

export interface ConnectorImageLinks {
    connector: string;
    self: string;
    spec: string;
}

export interface ConnectorImage {
    id: string;
    type: string;
    attributes: ConnectorImageAttributes;
    links: ConnectorImageLinks;
}

export interface ConnectorImagesResponse extends BaseResponse {
    data: ConnectorImage[];
    links: {
        self: string;
    };
}

export interface ConnectorImagesSpecAttributes {
    type: string;
    documentationURL: string;
    endpointSpecSchema: any;
    resourceSpecSchema: any;
}

export interface ConnectorImagesSpecLinks {
    connector: string;
    discovery: string;
    image: string;
    self: string;
}

export interface ConnectorImagesSpec {
    attributes: ConnectorImagesSpecAttributes;
    links: ConnectorImagesSpecLinks;
}

export interface ConnectorImagesSpecResponse {
    data: ConnectorImagesSpec;
}

export const connectorsEndpoint = {
    images: {
        read: (endpoint: ConnectorLinks['images']) => {
            return client<ConnectorsResponse>(endpoint);
        },
        spec: {
            read: (endpoint: ConnectorImageLinks['spec']) => {
                return client<ConnectorImagesSpecResponse>(endpoint);
            },
        },
    },
    read: () => {
        return client<ConnectorsResponse>('connectors');
    },
};
