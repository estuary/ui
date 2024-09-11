import { authenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useSearchParamAppend from 'hooks/searchParams/useSearchParamAppend';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { EntityWithCreateWorkflow } from 'types';
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
            advanceToForm?: boolean,
            dataPlaneId?: string | null
        ) => {
            const searchParamConfig: { [param: string]: any } = {};

            if (hasLength(id)) {
                searchParamConfig[GlobalSearchParams.CONNECTOR_ID] = id;
            }

            if (typeof dataPlaneId !== 'undefined') {
                searchParamConfig[GlobalSearchParams.DATA_PLANE_ID] = hasLength(
                    dataPlaneId
                )
                    ? dataPlaneId
                    : undefined;
            }

            const newSearchParams: URLSearchParams | null = !isEmpty(
                searchParamConfig
            )
                ? appendSearchParams(searchParamConfig)
                : null;

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
