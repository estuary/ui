import { PostgrestError } from '@supabase/postgrest-js';
import { SuccessResponseSingle } from 'hooks/supabase-swr/types';
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

export default useSelectSingle;
