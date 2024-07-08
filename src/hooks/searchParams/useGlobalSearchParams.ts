import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export enum GlobalSearchParams {
    CATALOG_NAME = 'catalogName',
    CONNECTOR_ID = 'connectorId',
    DRAFT_ID = 'draftId',
    FORCED_SHARD_ENABLE = 'forcedEnable',
    GRANT_TOKEN = 'grantToken',
    HIDDEN_SHOW_BETA = 'showBetaOnboard',
    HOME_PAGE_ERROR = 'homePageError',
    LAST_PUB_ID = 'lastPubId',
    LIVE_SPEC_ID = 'liveSpecId',
    LOGIN_HINTS_GOOGLE = 'google_login_hint',
    PREFILL_LIVE_SPEC_ID = 'prefillLiveSpecId',
    PREFIX = 'prefix',
    PROVIDER = 'provider', // Login Provider but having a url like login/?loginProvider looked weird
}

function useGlobalSearchParams<T = string>(key: GlobalSearchParams): T;
function useGlobalSearchParams<T = string>(
    key: GlobalSearchParams,
    fetchAll: true
): T[];
function useGlobalSearchParams<T = string>(
    key: GlobalSearchParams | Array<GlobalSearchParams>
): T[];
function useGlobalSearchParams<T = string>(
    key: GlobalSearchParams | Array<GlobalSearchParams>,
    fetchAll: true
): T[][];
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
