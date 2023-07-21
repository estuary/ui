import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

import { PostgrestError } from '@supabase/postgrest-js';

import {
    SuccessResponse,
    ToDistributedSuccessResponse,
} from 'hooks/supabase-swr/types';

import { Query } from '../query';
import useFetcher, { FetcherType } from './useFetcher';

const useSelect = <Data>(
    query: Query<Data>,
    swrConfig?: Omit<SWRConfiguration, 'fetcher'>
): SWRResponse<SuccessResponse<Data>, PostgrestError> => {
    const fetcher = useFetcher<Data>(FetcherType.MULTIPLE);
    return useSWR(query, fetcher, swrConfig);
};

export const useSelectNew = <Data>(
    fetcher: any,
    swrConfig?: Omit<SWRConfiguration, 'fetcher'>
): SWRResponse<SuccessResponse<Data>, PostgrestError> => {
    return useSWR(
        fetcher ? fetcher.url.href : null,
        () => fetcher.throwOnError(),
        swrConfig
    );
};

export const useDistributedSelectNew = <Data>(
    fetcher: any,
    swrConfig?: Omit<SWRConfiguration, 'fetcher'>
): SWRResponse<ToDistributedSuccessResponse<Data>, PostgrestError> => {
    return useSWR(
        fetcher ? fetcher.url.href : null,
        () => fetcher.throwOnError(),
        swrConfig
    );
};

export default useSelect;
