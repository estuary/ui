import type { Endpoint } from 'stores/ShardDetail/types';

export interface TaskEndpointProps {
    reactorAddress: string | undefined;
    taskName: string;
}

export interface EndpointLinkProps {
    endpoint: Endpoint;
    hostName: string | null;
}
