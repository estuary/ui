import { EntityWithCreateWorkflow } from 'types';

import { useCallback } from 'react';

import { useNavigate } from 'react-router';

import { authenticatedRoutes } from 'app/routes';

import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useSearchParamAppend from 'hooks/searchParams/useSearchParamAppend';

import { getPathWithParams, hasLength } from 'utils/misc-utils';

export default function useEntityCreateNavigate() {
    const navigate = useNavigate();
    const appendSearchParams = useSearchParamAppend();

    // TODO (optimization): Consider bundling the boolean input parameters in an "options" object
    //   to enhance code readability when they are passed in.
    return useCallback(
        (
            entity: EntityWithCreateWorkflow,
            id?: string | null | undefined,
            replace?: boolean,
            advanceToForm?: boolean
        ) => {
            let newSearchParams: URLSearchParams | null = null;
            if (hasLength(id)) {
                newSearchParams = appendSearchParams({
                    [GlobalSearchParams.CONNECTOR_ID]: id,
                });
            }

            let newPath: string | null = null;
            if (entity === 'capture') {
                newPath = advanceToForm
                    ? authenticatedRoutes.captures.create.new.fullPath
                    : authenticatedRoutes.captures.create.fullPath;
            } else {
                newPath = advanceToForm
                    ? authenticatedRoutes.materializations.create.new.fullPath
                    : authenticatedRoutes.materializations.create.fullPath;
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
