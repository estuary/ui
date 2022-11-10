import { PostgrestError } from '@supabase/postgrest-js';
import { SuccessResponseSingle } from 'hooks/supabase-swr/types';
import { useMemo } from 'react';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { Query } from '../query';
import useFetcher, { FetcherType } from './useFetcher';

const useSelectSingle = <Data>(
    query: Query<Data>,
    swrConfig?: Omit<SWRConfiguration, 'fetcher'>
): SWRResponse<SuccessResponseSingle<Data>, PostgrestError> => {
    const fetcher = useFetcher<Data>(FetcherType.SINGLE);
    return useSWR(query, fetcher, swrConfig);
};

export const useSelectSingleNew = <Data>(
    fetcher: any,
    swrConfig?: Omit<SWRConfiguration, 'fetcher'>
): SWRResponse<SuccessResponseSingle<Data>, PostgrestError> => {
    const key = useMemo(() => (fetcher ? fetcher.url.href : null), [fetcher]);
    const fetchFunction = useMemo(
        () => () => fetcher.throwOnError().single(),
        [fetcher]
    );
    console.log('select single new', key);
    return useSWR(key, fetchFunction, swrConfig);
};

export default useSelectSingle;
