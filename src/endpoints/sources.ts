import { BaseResponse } from 'types';
import { client } from './client';

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
