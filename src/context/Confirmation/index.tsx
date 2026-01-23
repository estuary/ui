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
    FormControlLabel,
    Switch,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { logRocketEvent } from 'src/services/shared';

const LABEL_ID = 'alert-dialog-title';
const DESCRIPTION_ID = 'alert-dialog-description';
const SKIP_CONFIRMATION_VALUE = 'yes';

const getDefaultSettings = (): IConfirmationModalOptions => {
    return {
        title: 'confirm.title',
        message: '',
        confirmText: 'cta.continue',
        cancelText: 'cta.cancel',
        doNotShowAgainText: 'confirm.doNotShowAgain',
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
    const [doNotShowAgain, setDoNotShowAgain] = useState<boolean>(false);

    const handlers = {
        confirm: () => {
            setDisableClick(true);

            // Save "do not show again" preference to local storage if applicable
            if (doNotShowAgain && settings.doNotShowAgainStorageKey) {
                localStorage.setItem(
                    settings.doNotShowAgainStorageKey,
                    SKIP_CONFIRMATION_VALUE
                );
            }

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
            // TODO (Localstorage)
            // Eventually we can make this like TableSettings but since only
            //  a single confirmation needs it just supporting a key is fine
            if (userSettings.doNotShowAgainStorageKey) {
                // Check if user has marked this as skipped
                const storedValue = localStorage.getItem(
                    userSettings.doNotShowAgainStorageKey
                );
                if (storedValue === SKIP_CONFIRMATION_VALUE) {
                    logRocketEvent('Confirmation', {
                        status: 'skipped',
                        localStorageKey: userSettings.doNotShowAgainStorageKey,
                    });
                    return Promise.resolve(true);
                }
            }

            setContinueAllowed(continueAllowedDefault);
            setSettings({
                ...getDefaultSettings(),
                ...userSettings,
            });
            setDisableClick(false);
            setDoNotShowAgain(false);
            setShowConfirmationModal(true);

            logRocketEvent('Confirmation', {
                status: 'show',
            });

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
                        {typeof settings.message === 'string' &&
                        settings.message.length > 0
                            ? intl.formatMessage({ id: settings.message })
                            : settings.message}
                    </Box>
                </DialogContent>

                <DialogActions
                    style={{
                        padding: '16px 24px',
                        justifyContent: 'space-between',
                    }}
                >
                    {settings.doNotShowAgainStorageKey ? (
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={doNotShowAgain}
                                    onChange={(_event, checked) => {
                                        setDoNotShowAgain(checked);
                                        logRocketEvent('Confirmation', {
                                            status: 'updating',
                                            doNotShowAgain: checked,
                                        });
                                    }}
                                />
                            }
                            label={intl.formatMessage({
                                id: settings.doNotShowAgainText,
                            })}
                        />
                    ) : null}

                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
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
                    </Box>
                </DialogActions>
            </Dialog>
        </ConfirmationModalContext.Provider>
    );
};

export const useConfirmationModalContext = () => {
    return useContext(ConfirmationModalContext);
};

export default ConfirmationModalContextProvider;
