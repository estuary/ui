import { client } from 'services/client';
import { BaseResponse } from 'types';

export interface SourcesResponse extends BaseResponse {
    data: any;
    links: {
        self: string;
    };
}

export const sourcesEndpoint = {
    read: () => {
        return client<SourcesResponse>('sources/all');
    },
};
