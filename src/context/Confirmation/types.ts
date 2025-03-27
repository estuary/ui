import { DialogProps } from '@mui/material';
import { Dispatch, ReactNode, SetStateAction } from 'react';

export interface IConfirmationModalOptions {
    confirmText?: string;
    cancelText?: string;
    title?: string;
    dialogProps?: Partial<DialogProps>;
    message: string | ReactNode;
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
