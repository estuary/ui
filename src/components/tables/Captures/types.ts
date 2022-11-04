import { LiveSpecsExtBaseQuery } from 'types';

// TODO: Consider consolidating query interface instances.
export interface LiveSpecsExtQuery extends LiveSpecsExtBaseQuery {
    writes_to: string[];
}
