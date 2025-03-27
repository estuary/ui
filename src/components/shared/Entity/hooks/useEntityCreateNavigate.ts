import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useSearchParamAppend from 'hooks/searchParams/useSearchParamAppend';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ENTITY_SETTINGS } from 'settings/entity';
import { EntityWithCreateWorkflow } from 'types';
import { getPathWithParams, hasLength } from 'utils/misc-utils';

export interface HookEntityCreateNavigateProps {
    advanceToForm?: boolean;
    dataPlaneId?: string | null;
    expressWorkflow?: boolean;
    id?: string | null | undefined;
}

export default function useEntityCreateNavigate() {
    const navigate = useNavigate();
    const appendSearchParams = useSearchParamAppend();

    return useCallback(
        (
            entity: EntityWithCreateWorkflow,
            {
                id,
                advanceToForm,
                dataPlaneId,
                expressWorkflow,
            }: HookEntityCreateNavigateProps
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

            let newPath: string = advanceToForm
                ? ENTITY_SETTINGS[entity].routes.createNew
                : ENTITY_SETTINGS[entity].routes.connectorSelect;

            if (entity === 'capture' && expressWorkflow && advanceToForm) {
                // TODO (powered-by-estuary): Use an error page as a fallback.
                newPath = ENTITY_SETTINGS[entity].routes.createNewExpress;
            }

            navigate(
                newSearchParams
                    ? getPathWithParams(newPath, newSearchParams)
                    : newPath
            );
        },
        [appendSearchParams, navigate]
    );
}
