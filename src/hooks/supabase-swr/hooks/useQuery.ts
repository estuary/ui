import { useMemo } from 'react';

import { createQuery, Query, QueryConfig } from '../query';

const useQuery = <Data>(
    table: string,
    config: QueryConfig<Data>,
    deps: any[]
): Query<Data> => {
    // console.log(`useQuery:${table}`, deps);
    return useMemo(() => {
        // console.log(`     useQuery:${table}:memo`, deps);
        return createQuery(table, config);
        // We only want to change the query if the dependencies we are told about change
        //   these are variables that are consumed inside of the QueryConfig
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

export default useQuery;
