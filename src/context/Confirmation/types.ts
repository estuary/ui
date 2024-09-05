import { Dispatch, ReactNode, SetStateAction } from 'react';

export interface IConfirmationModalOptions {
    confirmText?: string;
    cancelText?: string;
    title?: string;
    message: string | ReactNode;
}

export interface IConfirmationModalContext {
    setContinueAllowed: Dispatch<SetStateAction<boolean>>;
    showConfirmation: (
        { title, message, confirmText, cancelText }: IConfirmationModalOptions,
        allowContinueDefault?: boolean
    ) => Promise<any>;
}
