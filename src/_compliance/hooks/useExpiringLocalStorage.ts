// Based on https://usehooks-ts.com/react-hook/use-local-storage#hook

import type {
    SetWithExpiryFunction,
    UseExpiringLocalStorageOptions,
} from 'src/_compliance/types';
import type { ExpiringLocalStorageKeys } from 'src/utils/localStorage-utils';

import { useCallback, useEffect, useState } from 'react';

import { useEvent } from 'react-use';

import {
    EXPIRING_LOCAL_STORAGE_MESSAGE_KEY,
    getWithExpiry,
    setWithExpiry,
} from 'src/_compliance/shared';

export function useExpiringLocalStorage<T>(
    key: ExpiringLocalStorageKeys,
    initialValue: T | (() => T),
    options: UseExpiringLocalStorageOptions<T> = {}
): [T, SetWithExpiryFunction<T>, () => void] {
    const { initializeWithValue = true } = options;

    // Get from local storage then
    // parse stored json or return initialValue
    const readValue = useCallback((): T => {
        const initialValueToUse =
            initialValue instanceof Function ? initialValue() : initialValue;

        try {
            const raw = getWithExpiry<T>(key);
            return raw ?? initialValueToUse;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return initialValueToUse;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState(() => {
        if (initializeWithValue) {
            return readValue();
        }

        return initialValue instanceof Function ? initialValue() : initialValue;
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue: SetWithExpiryFunction<T> = useCallback(
        (value, duration) => {
            try {
                // Allow value to be a function so we have the same API as useState
                const newValue =
                    value instanceof Function ? value(readValue()) : value;

                // Set the value into LS. No need to update local state as that will be
                //  done when the event is fired from this function
                setWithExpiry(key, newValue, duration);
            } catch (error) {
                console.warn(`Error setting localStorage key “${key}”:`, error);
            }
        },
        [key, readValue]
    );

    const resetValue = useCallback(() => {
        const defaultValue =
            initialValue instanceof Function ? initialValue() : initialValue;

        // Remove the key from local storage
        setWithExpiry(key, defaultValue, null);
    }, [initialValue, key]);

    useEffect(() => {
        setStoredValue(readValue());
        // We only really care if the key changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const handleStorageChange = useCallback(
        (event: StorageEvent | CustomEvent) => {
            if (
                (event as StorageEvent).key &&
                (event as StorageEvent).key !== key
            ) {
                return;
            }
            setStoredValue(readValue());
        },
        [key, readValue]
    );

    useEvent(EXPIRING_LOCAL_STORAGE_MESSAGE_KEY, handleStorageChange);

    return [storedValue, setValue, resetValue];
}
