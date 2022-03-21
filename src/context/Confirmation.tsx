import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { createContext, useContext, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

export interface IConfirmationModalOptions {
    confirmText?: string;
    cancelText?: string;
    title?: string;
    message: string;
}

interface IConfirmationModalContext {
    showConfirmation: ({
        title,
        message,
        confirmText,
        cancelText,
    }: IConfirmationModalOptions) => Promise<any>;
}

const getDefaultSettings = (): IConfirmationModalOptions => {
    return {
        title: 'confirm.title',
        message: '',
        confirmText: 'cta.continue',
        cancelText: 'cta.cancel',
    };
};

const ConfirmationModalContext =
    createContext<IConfirmationModalContext | null>(null);

const ConfirmationModalContextProvider = ({ children }: BaseComponentProps) => {
    const [settings, setSettings] = useState<IConfirmationModalOptions>(
        getDefaultSettings()
    );
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const resolver = useRef<any>();

    const handlers = {
        confirm: () => {
            resolver.current?.(true);
            setShowConfirmationModal(false);
        },
        dismiss: () => {
            resolver.current?.(false);
            setShowConfirmationModal(false);
        },
        show: (userSettings: IConfirmationModalOptions) => {
            setSettings({
                ...getDefaultSettings(),
                ...userSettings,
            });
            setShowConfirmationModal(true);

            return new Promise((resolve) => {
                resolver.current = resolve;
            });
        },
    };

    return (
        <ConfirmationModalContext.Provider
            value={{ showConfirmation: handlers.show }}
        >
            {children}

            <Dialog
                open={showConfirmationModal}
                onClose={handlers.dismiss}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    <FormattedMessage id={settings.title} />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <FormattedMessage id={settings.message} />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="error" onClick={handlers.dismiss}>
                        <FormattedMessage id={settings.cancelText} />
                    </Button>
                    <Button
                        color="success"
                        variant="contained"
                        onClick={handlers.confirm}
                        autoFocus
                    >
                        <FormattedMessage id={settings.confirmText} />
                    </Button>
                </DialogActions>
            </Dialog>
        </ConfirmationModalContext.Provider>
    );
};

export const useConfirmationModalContext = () => {
    return useContext(ConfirmationModalContext);
};

export default ConfirmationModalContextProvider;
