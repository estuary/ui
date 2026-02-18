import { useCallback } from 'react';

import { useSearchParams } from 'react-router-dom';

const DIALOG_PARAM = 'dialog';

/**
 * Hook for controlling dialog visibility via URL search params.
 *
 * @param dialogId - Unique identifier for this dialog (e.g., 'create-storage-mapping')
 * @param contextParams - Additional param keys this dialog uses, cleaned up on close
 */
export function useDialogParam(dialogId: string, contextParams?: string[]) {
    const [searchParams, setSearchParams] = useSearchParams();

    const open = searchParams.get(DIALOG_PARAM) === dialogId;

    const onClose = useCallback(() => {
        setSearchParams((prev) => {
            prev.delete(DIALOG_PARAM);
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
    dialogId: string,
    context?: Record<string, string>
) {
    return (prev: URLSearchParams) => {
        prev.set(DIALOG_PARAM, dialogId);
        if (context) {
            for (const [key, value] of Object.entries(context)) {
                prev.set(key, value);
            }
        }
        return prev;
    };
}
