import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import React, { createContext, useContext, useRef, useState } from 'react';

export interface IConfirmationModalOptions {
    confirmButton?: string;
    cancelButton?: string;
    title?: string;
    message: string;
}

interface IConfirmationModalContext {
    showConfirmation: ({
        title,
        message,
        confirmButton,
        cancelButton,
    }: IConfirmationModalOptions) => Promise<any>;
}

const getDefaultSettings = (): IConfirmationModalOptions => {
    return {
        title: 'Are you sure?',
        message: '',
        confirmButton: 'Yes',
        cancelButton: 'No',
    };
};

const ConfirmationModalContext =
    createContext<IConfirmationModalContext | null>(null);

const ConfirmationModalContextProvider: React.FC = ({ children }) => {
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
                    {settings.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {settings.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handlers.dismiss}
                    >
                        {settings.cancelButton}
                    </Button>
                    <Button
                        color="success"
                        variant="contained"
                        onClick={handlers.confirm}
                        autoFocus
                    >
                        {settings.confirmButton}
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
