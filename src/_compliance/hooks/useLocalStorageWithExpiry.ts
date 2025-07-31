import type { DurationLike } from 'luxon';
import type { Dispatch, SetStateAction } from 'react';
import type { LocalStorageKeys } from 'src/utils/localStorage-utils';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { EVENT_MESSAGE_KEY } from 'src/_compliance/shared';
import { getWithExpiry, setWithExpiry } from 'src/utils/localStorage-utils';

const useLocalStorageWithExpiry = <T>(
    key: LocalStorageKeys,
    initialValue?: T,
    expirationSetting?: DurationLike
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void] => {
    if (!key) {
        throw new Error('useEstuaryLocalStorage key may not be falsy');
    }

    const initializer = useRef((key: LocalStorageKeys) => {
        try {
            const localStorageValue = getWithExpiry(key);
            if (localStorageValue !== null) {
                return localStorageValue;
            } else {
                if (initialValue) {
                    setWithExpiry(key, initialValue, expirationSetting);
                }

                window.dispatchEvent(
                    new StorageEvent(EVENT_MESSAGE_KEY, { key })
                );

                return initialValue;
            }
        } catch {
            // If user is in private mode or has storage restriction
            // localStorage can throw. JSON.parse and JSON.stringify
            // can throw, too.
            return initialValue;
        }
    });

    const [state, setState] = useState<any>(() => initializer.current(key));

    useLayoutEffect(() => setState(initializer.current(key)), [key]);

    const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
        (valOrFunc) => {
            try {
                const newState =
                    typeof valOrFunc === 'function'
                        ? (valOrFunc as Function)(state)
                        : valOrFunc;
                if (typeof newState === 'undefined') return;
                let value: string;

                value = JSON.stringify(newState);

                localStorage.setItem(key, value);
                setState(JSON.parse(value));
            } catch {
                // If user is in private mode or has storage restriction
                // localStorage can throw. Also JSON.stringify can throw.
            }
        },
        [key, state]
    );

    const remove = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setState(undefined);
        } catch {
            // If user is in private mode or has storage restriction
            // localStorage can throw.
        }
    }, [key, setState]);

    return [state, set, remove];
};

export default useLocalStorageWithExpiry;
