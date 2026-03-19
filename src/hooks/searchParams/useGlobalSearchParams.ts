import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { KnownSearchParams } from 'src/hooks/searchParams/types';

export enum GlobalSearchParams {
    CATALOG_NAME = 'catalogName',
    CONNECTOR_ID = 'connectorId',
    DATA_PLANE_ID = 'dataPlaneId',
    DIFF_VIEW_ORIGINAL = 'diff_o',
    DIFF_VIEW_MODIFIED = 'diff_m',
    DRAFT_ID = 'draftId',
    FORCED_SHARD_ENABLE = 'forcedEnable',
    GRANT_TOKEN = 'grantToken',
    HIDDEN_SHOW_BETA = 'showBetaOnboard',
    HOME_PAGE_ERROR = 'homePageError',
    PUB_ID = 'pubId',
    LAST_PUB_ID = 'lastPubId',
    LIVE_SPEC_ID = 'liveSpecId',
    LOGIN_HINTS_GOOGLE = 'google_login_hint',
    PREFILL_LIVE_SPEC_ID = 'prefillLiveSpecId',
    PREFIX = 'prefix',
    PROVIDER = 'provider', // Login Provider but having a url like login/?loginProvider looked weird
    DIALOG = 'dialog',
}

function useGlobalSearchParams<T = string>(key: KnownSearchParams): T;
function useGlobalSearchParams<T = string>(
    key: KnownSearchParams,
    fetchAll: true
): T[];
function useGlobalSearchParams<T = string>(
    key: KnownSearchParams | Array<KnownSearchParams>
): T[];
function useGlobalSearchParams<T = string>(
    key: KnownSearchParams | Array<KnownSearchParams>,
    fetchAll: true
): T[][];
function useGlobalSearchParams(
    key: KnownSearchParams | Array<KnownSearchParams>,
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
