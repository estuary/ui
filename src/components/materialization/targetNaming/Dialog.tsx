import type { TargetNamingStrategy } from 'src/types';

import { useCallback, useRef, useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { TargetNamingFormContent } from 'src/components/materialization/targetNaming/FormContent';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

interface Props {
    open: boolean;
    onCancel: () => void;
    onConfirm: (strategy: TargetNamingStrategy) => void;
    confirmLabel: string;
    initialStrategy?: TargetNamingStrategy | null;
    saving?: boolean;
    alertMessage?: string;
}

export function TargetNamingDialog({
    open,
    initialStrategy,
    onCancel,
    onConfirm,
    confirmLabel,
    saving,
    alertMessage,
}: Props) {
    const strategyRef = useRef<TargetNamingStrategy>({
        strategy: 'matchSourceStructure',
    });
    const [canConfirm, setCanConfirm] = useState(true);

    const handleConfirm = () => {
        if (!canConfirm || saving) return;
        onConfirm(strategyRef.current);
    };

    const handleChange = useCallback(
        (strategy: TargetNamingStrategy, isValid: boolean) => {
            strategyRef.current = strategy;
            setCanConfirm(isValid);
        },
        []
    );

    return (
        <Dialog open={open} fullWidth maxWidth="md">
            <DialogTitleWithClose
                id="destination-layout-dialog-title"
                disabled={saving}
                onClose={onCancel}
            >
                Destination Layout
            </DialogTitleWithClose>

            <DialogContent>
                <Stack spacing={2}>
                    {alertMessage ? (
                        <AlertBox severity="info" short>
                            {alertMessage}
                        </AlertBox>
                    ) : null}
                    <TargetNamingFormContent
                        initialStrategy={initialStrategy}
                        onChange={handleChange}
                        disabled={saving}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onCancel} disabled={saving} variant="text">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canConfirm || saving}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/** @deprecated Prefer the named `TargetNamingDialog` export */
export default function TargetNamingDialogWrapper({
    confirmIntlKey,
    alertIntlKey,
    ...props
}: Omit<Props, 'confirmLabel' | 'alertMessage'> & {
    confirmIntlKey: string;
    alertIntlKey?: string;
}) {
    const intl = useIntl();

    return (
        <TargetNamingDialog
            {...props}
            confirmLabel={intl.formatMessage({ id: confirmIntlKey })}
            alertMessage={
                alertIntlKey
                    ? intl.formatMessage({ id: alertIntlKey })
                    : undefined
            }
        />
    );
}
