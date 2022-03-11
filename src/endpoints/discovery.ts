import { ConnectorImagesSpecLinks } from 'endpoints/connectors';
import { client } from 'services/client';
import { BaseResponse } from 'types';

export interface DiscoveredCatalog {
    id: string;
    type: string;
    attributes: {
        bindings: any[];
    };
    links: {
        image: string;
    };
}

export interface DiscoveryResponse extends BaseResponse {
    data: DiscoveredCatalog;
}

export const discoveryEndpoint = {
    create: (endpoint: ConnectorImagesSpecLinks['discovery'], data: any) => {
        return client<DiscoveryResponse>(endpoint, { data });
    },
};
