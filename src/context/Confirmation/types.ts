import { ReactNode } from 'react';

export interface IConfirmationModalOptions {
    confirmText?: string;
    cancelText?: string;
    title?: string;
    message: string | ReactNode;
}

export interface IConfirmationModalContext {
    setContinueAllowed: (newVal: boolean) => void;
    showConfirmation: ({
        title,
        message,
        confirmText,
        cancelText,
    }: IConfirmationModalOptions) => Promise<any>;
}
