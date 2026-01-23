import type {
    IConfirmationModalContext,
    IConfirmationModalOptions,
} from 'src/context/Confirmation/types';
import type { BaseComponentProps } from 'src/types';

import { createContext, useContext, useRef, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

import { useIntl } from 'react-intl';

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
    const intl = useIntl();

    const [settings, setSettings] =
        useState<IConfirmationModalOptions>(getDefaultSettings());
    const [showConfirmationModal, setShowConfirmationModal] =
        useState<boolean>(false);
    const resolver = useRef<any>();

    const [continueAllowed, setContinueAllowed] = useState<boolean>(true);
    const [disableClick, setDisableClick] = useState<boolean>(false);

    const handlers = {
        confirm: () => {
            setDisableClick(true);
            resolver.current?.(true);
            setShowConfirmationModal(false);
        },
        dismiss: () => {
            resolver.current?.(false);
            setShowConfirmationModal(false);
        },
        show: (
            userSettings: IConfirmationModalOptions,
            continueAllowedDefault = true
        ) => {
            setContinueAllowed(continueAllowedDefault);
            setSettings({
                ...getDefaultSettings(),
                ...userSettings,
            });
            setDisableClick(false);
            setShowConfirmationModal(true);

            return new Promise((resolve) => {
                resolver.current = resolve;
            });
        },
    };

    return (
        <ConfirmationModalContext.Provider
            value={{ setContinueAllowed, showConfirmation: handlers.show }}
        >
            {children}

            <Dialog
                open={showConfirmationModal}
                onClose={handlers.dismiss}
                aria-labelledby={LABEL_ID}
                aria-describedby={DESCRIPTION_ID}
                {...(settings.dialogProps ?? {})}
            >
                <DialogTitle id={LABEL_ID}>
                    {intl.formatMessage({ id: settings.title })}
                </DialogTitle>

                <DialogContent>
                    <Box id={DESCRIPTION_ID} color="text.primary">
                        {typeof settings.message === 'string'
                            ? intl.formatMessage({ id: settings.message })
                            : settings.message}
                    </Box>
                </DialogContent>

                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button variant="text" onClick={handlers.dismiss}>
                        {intl.formatMessage({ id: settings.cancelText })}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handlers.confirm}
                        autoFocus
                        disabled={disableClick || !continueAllowed}
                    >
                        {intl.formatMessage({ id: settings.confirmText })}
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
