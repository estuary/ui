import useSWR, { SWRConfiguration } from 'swr';
import { Query } from '../query';
import useFetcher, { FetcherType } from './useFetcher';

const useSelectMaybeSingle = <Data>(
    query: Query<Data>,
    swrConfig?: Omit<SWRConfiguration, 'fetcher'>
) => {
    const fetcher = useFetcher<Data>(FetcherType.MAYBE_SINGLE);
    return useSWR(query, fetcher, swrConfig);
};

export default useSelectMaybeSingle;
