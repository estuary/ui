import { ConnectorImagesSpecLinks } from 'endpoints/connectors';
import { client } from 'services/client';
import { BaseResponse } from 'types';

export interface DiscoveredCatalogImport {
    contentType: string;
    url: string;
}

export interface DiscoveredCatalogResources {
    [k: string]: any;
}

export interface DiscoveredCatalogAttributes {
    resources: DiscoveredCatalogResources;
    import: DiscoveredCatalogImport[];
}

export interface DiscoveredCatalog {
    id: string;
    type: string;
    attributes: DiscoveredCatalogAttributes;
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
