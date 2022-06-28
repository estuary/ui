import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { slate } from 'context/Theme';
import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

export interface IConfirmationModalOptions {
    confirmText?: string;
    cancelText?: string;
    title?: string;
    message: string | ReactNode;
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
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: (themes) =>
                            themes.palette.mode === 'dark'
                                ? slate[800]
                                : slate[25],
                        borderRadius: 5,
                        backgroundImage: (themes) =>
                            themes.palette.mode === 'dark'
                                ? 'linear-gradient(160deg, rgba(99, 138, 169, 0.24) 0%, rgba(13, 43, 67, 0.22) 75%, rgba(13, 43, 67, 0.18) 100%)'
                                : 'linear-gradient(160deg, rgba(246, 250, 255, 0.4) 0%, rgba(216, 233, 245, 0.4) 75%, rgba(172, 199, 220, 0.4) 100%)',
                    },
                }}
            >
                <DialogTitle id={LABEL_ID}>
                    <FormattedMessage id={settings.title} />
                </DialogTitle>

                <DialogContent>
                    <DialogContentText id={DESCRIPTION_ID} color="text.primary">
                        {typeof settings.message === 'string' ? (
                            <FormattedMessage id={settings.message} />
                        ) : (
                            settings.message
                        )}
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button
                        onClick={handlers.dismiss}
                        sx={{
                            'backgroundColor': (themes) =>
                                themes.palette.mode === 'dark'
                                    ? slate[50]
                                    : slate[100],
                            '&:hover': {
                                backgroundColor: (themes) =>
                                    themes.palette.mode === 'dark'
                                        ? slate[100]
                                        : slate[200],
                            },
                        }}
                    >
                        <FormattedMessage id={settings.cancelText} />
                    </Button>

                    <Button onClick={handlers.confirm} autoFocus>
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
