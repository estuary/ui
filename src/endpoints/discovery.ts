import { ConnectorImagesSpecResponse } from 'endpoints/connectors';
import { client } from 'services/client';
import { BaseResponse } from 'types';

export interface DiscoveryResponse extends BaseResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            bindings: any[];
        };
        links: {
            image: string;
        };
    };
}

export const discoveryEndpoint = {
    create: (
        endpoint: ConnectorImagesSpecResponse['data']['links']['discovery'],
        data: any
    ) => {
        return client<DiscoveryResponse>(endpoint, { data });
    },
};
