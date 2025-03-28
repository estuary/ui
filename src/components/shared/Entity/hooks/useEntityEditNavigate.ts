import { useCallback } from 'react';

import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router';

import { authenticatedRoutes } from 'src/app/routes';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import useSearchParamAppend from 'src/hooks/searchParams/useSearchParamAppend';
import { Entity } from 'src/types';
import { getPathWithParams } from 'src/utils/misc-utils';

interface BaseSearchParams {
    [GlobalSearchParams.CONNECTOR_ID]: string;
    [GlobalSearchParams.LIVE_SPEC_ID]: string;
    [GlobalSearchParams.LAST_PUB_ID]: string;
}

interface OptionalSearchParams {
    [GlobalSearchParams.PREFILL_LIVE_SPEC_ID]?: string | string[];
    [GlobalSearchParams.DRAFT_ID]?: string;
    // Param to keep track of when we force enable something so if someone
    //  reloads the page their draft will get switched back properly.
    [GlobalSearchParams.FORCED_SHARD_ENABLE]?: boolean;
}

export default function useEntityEditNavigate() {
    const navigate = useNavigate();
    const appendSearchParams = useSearchParamAppend();

    // TODO (optimization): Consider bundling the boolean input parameters in an "options" object
    //   to enhance code readability when they are passed in.
    return useCallback(
        (
            entity: Entity,
            baseSearchParams: BaseSearchParams,
            optionalSearchParams?: OptionalSearchParams | null,
            replace?: boolean
        ) => {
            const searchParams: URLSearchParams = appendSearchParams(
                !isEmpty(optionalSearchParams)
                    ? {
                          ...baseSearchParams,
                          ...optionalSearchParams,
                      }
                    : baseSearchParams
            );

            let newPath: string | null = null;

            if (entity === 'capture') {
                newPath = authenticatedRoutes.captures.edit.fullPath;
            } else {
                newPath = authenticatedRoutes.materializations.edit.fullPath;
            }

            navigate(getPathWithParams(newPath, searchParams), {
                replace,
            });
        },
        [appendSearchParams, navigate]
    );
}
