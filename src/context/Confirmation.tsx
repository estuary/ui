import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

export interface IConfirmationModalOptions {
    message: string | ReactNode;
    cancelText?: string;
    confirmText?: string;
    title?: string;
}

interface IConfirmationModalContext {
    showConfirmation: ({
        title,
        message,
        confirmText,
        cancelText,
    }: IConfirmationModalOptions) => Promise<any>;
}

const LABEL_ID = 'alert-dialog-title';
const DESCRIPTION_ID = 'alert-dialog-description';

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
                aria-labelledby={LABEL_ID}
                aria-describedby={DESCRIPTION_ID}
            >
                <DialogTitle id={LABEL_ID}>
                    <FormattedMessage id={settings.title} />
                </DialogTitle>

                <DialogContent>
                    <Box id={DESCRIPTION_ID} color="text.primary">
                        {typeof settings.message === 'string' ? (
                            <FormattedMessage id={settings.message} />
                        ) : (
                            settings.message
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button variant="text" onClick={handlers.dismiss}>
                        <FormattedMessage id={settings.cancelText} />
                    </Button>

                    <Button
                        variant="outlined"
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
