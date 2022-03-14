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

export interface DiscoveredCatalogResponse extends BaseResponse {
    data: DiscoveredCatalog;
}

export const discoveredCatalogEndpoint = {
    create: (
        endpoint: ConnectorImagesSpecLinks['discovered_catalog'],
        data: any
    ) => {
        return client<DiscoveredCatalogResponse>(endpoint, { data });
    },
};
