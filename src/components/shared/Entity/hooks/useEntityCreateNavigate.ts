import { authenticatedRoutes } from 'app/Authenticated';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useSearchParamAppend from 'hooks/searchParams/useSearchParamAppend';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ENTITY } from 'types';
import { getPathWithParams, hasLength } from 'utils/misc-utils';

export default function useEntityCreateNavigate() {
    const navigate = useNavigate();
    const appendSearchParams = useSearchParamAppend();

    return useCallback(
        (
            entity: ENTITY.CAPTURE | ENTITY.MATERIALIZATION,
            id?: string | null | undefined,
            replace?: boolean
        ) => {
            let newSearchParams: URLSearchParams | null = null;
            if (hasLength(id)) {
                newSearchParams = appendSearchParams({
                    [GlobalSearchParams.CONNECTOR_ID]: id,
                });
            }

            let newPath: string | null = null;
            if (entity === ENTITY.CAPTURE) {
                newPath = authenticatedRoutes.captures.create.fullPath;
            } else {
                newPath = authenticatedRoutes.materializations.create.fullPath;
            }

            navigate(
                newSearchParams
                    ? getPathWithParams(newPath, newSearchParams)
                    : newPath,
                {
                    replace,
                }
            );
        },
        [appendSearchParams, navigate]
    );
}
