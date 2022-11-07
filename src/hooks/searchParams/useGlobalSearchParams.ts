import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export enum GlobalSearchParams {
    CONNECTOR_ID = 'connectorId',
    LIVE_SPEC_ID = 'liveSpecId',
    LAST_PUB_ID = 'lastPubId',
    HIDDEN_SHOW_BETA = 'showBetaOnboard',
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
