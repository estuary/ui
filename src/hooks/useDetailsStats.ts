import { CatalogStats_Details } from 'types';

import { getStatsForDetails } from 'api/stats';

import { useEntityType } from 'context/EntityContext';

import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';

import { hasLength } from 'utils/misc-utils';

function useDetailsStats(
    catalogName: string,
    grain: string,
    duration: Duration
) {
    const entityType = useEntityType();

    const { data, error, isValidating } = useSelectNew<CatalogStats_Details>(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, grain, duration)
            : null,
        {
            refreshInterval: 15000,
        }
    );

    // Not always returning an array so we know when the empty array is a response
    //  vs a default. That way we can keep showing old data while new data is geing fetched
    //  during isValidating
    return {
        stats: data?.data,
        error,
        isValidating,
    };
}

export default useDetailsStats;
