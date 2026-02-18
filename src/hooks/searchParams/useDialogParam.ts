import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';

const Dialogs = {
    CREATE_STORAGE_MAPPING: {
        id: 'create-storage-mapping',
        contextParams: [],
    },
    EDIT_STORAGE_MAPPING: {
        id: 'edit-storage-mapping',
        contextParams: ['prefix'],
    },
} as const;

type DialogKey = keyof typeof Dialogs;

type ContextParams<K extends DialogKey> =
    (typeof Dialogs)[K]['contextParams'][number];

// When a dialog has context params, require them. Otherwise, no args.
type OpenArgs<K extends DialogKey> = ContextParams<K> extends never
    ? []
    : [context: Record<ContextParams<K>, string>];

/**
 * Hook for managing dialog visibility via URL search params.
 *
 * @param key - Key from the Dialogs config
 */
export function useDialog<K extends DialogKey>(key: K) {
    const { id, contextParams } = Dialogs[key];
    const [searchParams, setSearchParams] = useSearchParams();

    const open = searchParams.get(GlobalSearchParams.DIALOG) === id;

    const context = useMemo(() => {
        const obj = {} as Record<ContextParams<K>, string | null>;
        contextParams.forEach((param) => {
            (obj as Record<string, string | null>)[param] =
                searchParams.get(param);
        });
        return obj;
    }, [searchParams, contextParams]);

    const onOpen = useCallback(
        (...args: OpenArgs<K>) => {
            setSearchParams(openDialogParams(key, ...args));
        },
        [setSearchParams, key]
    );

    const onClose = useCallback(() => {
        setSearchParams((prev) => {
            prev.delete(GlobalSearchParams.DIALOG);
            contextParams.forEach((param) => prev.delete(param));
            return prev;
        });
    }, [setSearchParams, contextParams]);

    return { open, onOpen, onClose, context };
}

/**
 * Helper to build search param setter for opening a dialog.
 * Useful when you need to build a URL string rather than navigate imperatively.
 */
export function openDialogParams<K extends DialogKey>(
    key: K,
    ...args: OpenArgs<K>
) {
    const { id } = Dialogs[key];
    const [context] = args;

    return (prev: URLSearchParams) => {
        prev.set(GlobalSearchParams.DIALOG, id);
        if (context) {
            for (const [k, value] of Object.entries(
                context as Record<string, string>
            )) {
                prev.set(k, value);
            }
        }
        return prev;
    };
}
