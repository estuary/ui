import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getPathWithParams } from 'utils/misc-utils';
import { GlobalSearchParams } from './searchParams/useGlobalSearchParams';

interface Data {
    catalog_name: string;
    last_pub_id: string;
}

function useDetailsNavigator(path: string) {
    const navigate = useNavigate();

    const generatePath = useCallback(
        (data: Data) => {
            return getPathWithParams(path, {
                [GlobalSearchParams.CATALOG_NAME]: data.catalog_name,
            });
        },
        [path]
    );

    const navigateToPath = useCallback(
        (data: Data) => {
            navigate(
                getPathWithParams(path, {
                    [GlobalSearchParams.CATALOG_NAME]: data.catalog_name,
                })
            );
        },
        [navigate, path]
    );
    return { generatePath, navigateToPath };
}

export default useDetailsNavigator;
