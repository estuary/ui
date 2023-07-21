import { useMemo } from 'react';

import {
    createDistributedQuery,
    DistributedQueryConfig,
    ToDistributedQuery,
} from '../query';

const useDistributiveQuery = <Data>(
    table: string,
    config: DistributedQueryConfig<Data>,
    deps: any[]
): ToDistributedQuery<Data> => {
    // console.log(`useQuery:${table}`, deps);
    return useMemo(() => {
        // console.log(`     useQuery:${table}:memo`, deps);
        return createDistributedQuery(table, config);
        // We only want to change the query if the dependencies we are told about change
        //   these are variables that are consumed inside of the QueryConfig
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

export default useDistributiveQuery;
