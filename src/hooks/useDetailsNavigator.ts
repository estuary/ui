import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getPathWithParams } from 'src/utils/misc-utils';
import { GlobalSearchParams } from './searchParams/useGlobalSearchParams';

interface Data {
    catalog_name: string;
}

function useDetailsNavigator(path: string) {
    const navigate = useNavigate();

    const generatePath = useCallback(
        (data: Data, pathOverride?: string) => {
            return getPathWithParams(pathOverride ?? path, {
                [GlobalSearchParams.CATALOG_NAME]: data.catalog_name,
            });
        },
        [path]
    );

    const navigateToPath = useCallback(
        (data: Data, pathOverride?: string) => {
            navigate(
                getPathWithParams(pathOverride ?? path, {
                    [GlobalSearchParams.CATALOG_NAME]: data.catalog_name,
                })
            );
        },
        [navigate, path]
    );
    return { generatePath, navigateToPath };
}

export default useDetailsNavigator;
