import {
    CaptureQueryWithStats,
    CollectionQueryWithStats,
    MaterializationQueryWithStats,
} from 'api/liveSpecsExt';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getPathWithParams } from 'utils/misc-utils';
import { GlobalSearchParams } from './useGlobalSearchParams';

type Row =
    | CollectionQueryWithStats
    | MaterializationQueryWithStats
    | CaptureQueryWithStats;
function useDetailsNavigator(path: string) {
    const navigate = useNavigate();

    const generatePath = useCallback(
        (row: Row) => {
            return getPathWithParams(path, {
                [GlobalSearchParams.CATALOG_NAME]: row.catalog_name,
                [GlobalSearchParams.LAST_PUB_ID]: row.last_pub_id,
            });
        },
        [path]
    );

    const navigateToPath = useCallback(
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
    return { generatePath, navigateToPath };
}

export default useDetailsNavigator;
