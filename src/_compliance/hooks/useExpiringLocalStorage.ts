// Based on https://usehooks-ts.com/react-hook/use-local-storage#hook

import type { Dispatch, SetStateAction } from 'react';

import { useCallback, useEffect, useState } from 'react';

import { useEvent } from 'react-use';

type UseLocalStorageOptions<T> = {
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
    initializeWithValue?: boolean;
};

const MESSAGE_KEY = 'est_local_storage';

export function useExpiringLocalStorage<T>(
    key: string,
    initialValue: T | (() => T),
    options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void] {
    const { initializeWithValue = true } = options;

    const serializer = useCallback<(value: T) => string>(
        (value) => {
            if (options.serializer) {
                return options.serializer(value);
            }

            return JSON.stringify(value);
        },
        [options]
    );

    const deserializer = useCallback<(value: string) => T>(
        (value) => {
            if (options.deserializer) {
                return options.deserializer(value);
            }
            // Support 'undefined' as a value
            if (value === 'undefined') {
                return undefined as unknown as T;
            }

            const defaultValue =
                initialValue instanceof Function
                    ? initialValue()
                    : initialValue;

            let parsed: unknown;
            try {
                parsed = JSON.parse(value);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return defaultValue; // Return initialValue if parsing fails
            }

            return parsed as T;
        },
        [options, initialValue]
    );

    // Get from local storage then
    // parse stored json or return initialValue
    const readValue = useCallback((): T => {
        const initialValueToUse =
            initialValue instanceof Function ? initialValue() : initialValue;

        try {
            const raw = window.localStorage.getItem(key);
            return raw ? deserializer(raw) : initialValueToUse;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return initialValueToUse;
        }
    }, [initialValue, key, deserializer]);

    const [storedValue, setStoredValue] = useState(() => {
        if (initializeWithValue) {
            return readValue();
        }

        return initialValue instanceof Function ? initialValue() : initialValue;
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue: Dispatch<SetStateAction<T>> = useCallback(
        (value) => {
            try {
                // Allow value to be a function so we have the same API as useState
                const newValue =
                    value instanceof Function ? value(readValue()) : value;

                // Save to local storage
                window.localStorage.setItem(key, serializer(newValue));

                // Save state
                setStoredValue(newValue);

                // We dispatch a custom event so every similar useLocalStorage hook is notified
                window.dispatchEvent(new StorageEvent(MESSAGE_KEY, { key }));
            } catch (error) {
                console.warn(`Error setting localStorage key “${key}”:`, error);
            }
        },
        [key, readValue, serializer]
    );

    const removeValue = useCallback(() => {
        const defaultValue =
            initialValue instanceof Function ? initialValue() : initialValue;

        // Remove the key from local storage
        window.localStorage.removeItem(key);

        // Save state with default value
        setStoredValue(defaultValue);

        // We dispatch a custom event so every similar useLocalStorage hook is notified
        window.dispatchEvent(new StorageEvent(MESSAGE_KEY, { key }));
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

    useEvent(MESSAGE_KEY, handleStorageChange);

    return [storedValue, setValue, removeValue];
}
