import {
    CaptureQueryWithStats,
    CollectionQueryWithStats,
    MaterializationQueryWithStats,
} from 'api/liveSpecsExt';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getPathWithParams } from 'utils/misc-utils';
import { GlobalSearchParams } from './searchParams/useGlobalSearchParams';

type Row =
    | CollectionQueryWithStats
    | MaterializationQueryWithStats
    | CaptureQueryWithStats;
function useDetailsNavigator(path: string) {
    const navigate = useNavigate();

    const detailsNavigator = useCallback(
        (row: Row) => {
            navigate(
                getPathWithParams(path, {
                    [GlobalSearchParams.CATALOG_NAME]: row.catalog_name,
                    [GlobalSearchParams.LAST_PUB_ID]: row.last_pub_id,
                })
            );
        },
        [navigate, path]
    );
    return detailsNavigator;
}

export default useDetailsNavigator;
