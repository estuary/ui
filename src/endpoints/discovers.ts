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

export const discoversEndpoint = {
    create: (
        endpoint: ConnectorImagesSpecLinks['discovered_catalog'],
        data: any
    ) => {
        return client<DiscoveredCatalogResponse>(endpoint, { data });
    },
    helpers: {
        getFlowSchema: (response?: DiscoveredCatalogAttributes) => {
            if (response) {
                const flowIndex = Object.keys(response.resources).find((e) =>
                    e.endsWith('.flow.json')
                );

                if (flowIndex) {
                    return response.resources[flowIndex].content.collections;
                }
            }

            return null;
        },
    },
};
