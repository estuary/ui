import { globalSearchParams } from 'app/Authenticated';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

function useGlobalSearchParams(key: globalSearchParams): string;
function useGlobalSearchParams(
    key: globalSearchParams,
    fetchAll: true
): string[];
function useGlobalSearchParams(
    key: globalSearchParams | Array<globalSearchParams>
): string[];
function useGlobalSearchParams(
    key: globalSearchParams | Array<globalSearchParams>,
    fetchAll: true
): string[][];
function useGlobalSearchParams(
    key: globalSearchParams | Array<globalSearchParams>,
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
