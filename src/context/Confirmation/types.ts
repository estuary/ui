import type { DialogProps } from '@mui/material';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { LocalStorageKeys } from 'src/utils/localStorage-utils';

export interface IConfirmationModalOptions {
    confirmText?: string;
    cancelText?: string;
    title?: string;
    dialogProps?: Partial<DialogProps>;
    message: string | ReactNode;
    doNotShowAgainStorageKey?: LocalStorageKeys;
    doNotShowAgainText?: string;
}

export interface IConfirmationModalContext {
    setContinueAllowed: Dispatch<SetStateAction<boolean>>;
    showConfirmation: (
        {
            title,
            message,
            confirmText,
            cancelText,
            dialogProps,
        }: IConfirmationModalOptions,
        allowContinueDefault?: boolean
    ) => Promise<any>;
}
