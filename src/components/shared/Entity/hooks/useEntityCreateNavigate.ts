import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useSearchParamAppend from 'hooks/searchParams/useSearchParamAppend';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ENTITY_SETTINGS } from 'settings/entity';
import type { EntityWithCreateWorkflow } from 'types';
import { getPathWithParams, hasLength } from 'utils/misc-utils';

export interface HookEntityCreateNavigateProps {
    advanceToForm?: boolean;
    dataPlaneId?: string | null;
    id?: string | null | undefined;
}

export default function useEntityCreateNavigate() {
    const navigate = useNavigate();
    const appendSearchParams = useSearchParamAppend();

    return useCallback(
        (
            entity: EntityWithCreateWorkflow,
            { id, advanceToForm, dataPlaneId }: HookEntityCreateNavigateProps
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

            const newPath: string = advanceToForm
                ? ENTITY_SETTINGS[entity].routes.createNew
                : ENTITY_SETTINGS[entity].routes.connectorSelect;

            navigate(
                newSearchParams
                    ? getPathWithParams(newPath, newSearchParams)
                    : newPath
            );
        },
        [appendSearchParams, navigate]
    );
}
