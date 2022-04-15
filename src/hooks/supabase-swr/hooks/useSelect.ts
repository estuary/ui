import { PostgrestError } from '@supabase/postgrest-js';
import { SuccessResponse } from 'hooks/supabase-swr/types';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { Query } from '../query';
import useFetcher, { FetcherType } from './useFetcher';

const useSelect = <Data>(
    query: Query<Data>,
    swrConfig: Omit<SWRConfiguration, 'fetcher'>
): SWRResponse<SuccessResponse<Data>, PostgrestError> => {
    const fetcher = useFetcher<Data>(FetcherType.MULTIPLE);
    return useSWR(query, fetcher, swrConfig);
};

export default useSelect;
