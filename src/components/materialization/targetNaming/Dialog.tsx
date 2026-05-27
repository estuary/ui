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
    confirmIntlKey: string;
    initialStrategy?: TargetNamingStrategy | null;
    saving?: boolean;
    alertIntlKey?: string;
}

export default function TargetNamingDialog({
    open,
    initialStrategy,
    onCancel,
    onConfirm,
    confirmIntlKey,
    saving,
    alertIntlKey,
}: Props) {
    const intl = useIntl();

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
                {intl.formatMessage({ id: 'destinationLayout.dialog.title' })}
            </DialogTitleWithClose>

            <DialogContent>
                <Stack spacing={2}>
                    {alertIntlKey ? (
                        <AlertBox severity="info" short>
                            {intl.formatMessage({ id: alertIntlKey })}
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
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canConfirm || saving}
                >
                    {intl.formatMessage({ id: confirmIntlKey })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
