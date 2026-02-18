import { useCallback } from 'react';

import { useSearchParams } from 'react-router-dom';

import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';

export const DialogId = {
    CREATE_STORAGE_MAPPING: 'create-storage-mapping',
    EDIT_STORAGE_MAPPING: 'edit-storage-mapping',
} as const;

type DialogId = (typeof DialogId)[keyof typeof DialogId];

/**
 * Hook for controlling dialog visibility via URL search params.
 *
 * @param dialogId - Unique identifier for this dialog
 * @param contextParams - Additional param keys this dialog uses, cleaned up on close
 */
export function useDialogParam(dialogId: DialogId, contextParams?: string[]) {
    const [searchParams, setSearchParams] = useSearchParams();

    const open = searchParams.get(GlobalSearchParams.DIALOG) === dialogId;

    const onClose = useCallback(() => {
        setSearchParams((prev) => {
            prev.delete(GlobalSearchParams.DIALOG);
            contextParams?.forEach((key) => prev.delete(key));
            return prev;
        });
    }, [setSearchParams, contextParams]);

    return { open, onClose, searchParams };
}

/**
 * Helper to build search param setter for opening a dialog.
 */
export function openDialogParams(
    dialogId: DialogId,
    context?: Record<string, string>
) {
    return (prev: URLSearchParams) => {
        prev.set(GlobalSearchParams.DIALOG, dialogId);
        if (context) {
            for (const [key, value] of Object.entries(context)) {
                prev.set(key, value);
            }
        }
        return prev;
    };
}
