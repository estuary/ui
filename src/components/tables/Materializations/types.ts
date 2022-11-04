import { LiveSpecsExtBaseQuery } from 'types';

// TODO: Consider consolidating query interface instances.
export interface LiveSpecsExtQuery extends LiveSpecsExtBaseQuery {
    reads_from: string[];
}
