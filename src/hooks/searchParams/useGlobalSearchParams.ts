import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

export enum GlobalSearchParams {
    CATALOG_NAME = 'catalogName',
    CONNECTOR_ID = 'connectorId',
    DRAFT_ID = 'draftId',
    GRANT_TOKEN = 'grantToken',
    HIDDEN_SHOW_BETA = 'showBetaOnboard',
    HIDDEN_TRANSFORM_WORKFLOW = 'newTransformWorkflow',
    LAST_PUB_ID = 'lastPubId',
    LIVE_SPEC_ID = 'liveSpecId',
    PREFILL_PUB_ID = 'prefillPubId',
}

function useGlobalSearchParams(key: GlobalSearchParams): string;
function useGlobalSearchParams(
    key: GlobalSearchParams,
    fetchAll: true
): string[];
function useGlobalSearchParams(
    key: GlobalSearchParams | Array<GlobalSearchParams>
): string[];
function useGlobalSearchParams(
    key: GlobalSearchParams | Array<GlobalSearchParams>,
    fetchAll: true
): string[][];
function useGlobalSearchParams(
    key: GlobalSearchParams | Array<GlobalSearchParams>,
    fetchAll?: boolean
) {
    const [searchParams] = useSearchParams();

    const getValue = useCallback(
        (keyVal: string) => {
            if (fetchAll) {
                return searchParams.getAll(keyVal);
            } else {
                return searchParams.get(keyVal);
            }
        },
        [fetchAll, searchParams]
    );

    return useMemo(() => {
        if (Array.isArray(key)) {
            return key.map((keyVal: string) => {
                return getValue(keyVal);
            });
        } else {
            return getValue(key);
        }
    }, [getValue, key]);
}

export default useGlobalSearchParams;
