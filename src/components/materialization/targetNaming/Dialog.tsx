import type { TargetNamingStrategy } from 'src/types';

import { useCallback, useRef, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';

import { useIntl } from 'react-intl';

import { TargetNamingFormContent } from 'src/components/materialization/targetNaming/FormContent';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

interface Props {
    open: boolean;
    onCancel: () => void;
    onConfirm: (strategy: TargetNamingStrategy) => void;
    confirmIntlKey: string;
    initialStrategy?: TargetNamingStrategy | null;
}

export default function TargetNamingDialog({
    open,
    initialStrategy,
    onCancel,
    onConfirm,
    confirmIntlKey,
}: Props) {
    const intl = useIntl();

    const strategyRef = useRef<TargetNamingStrategy>({
        strategy: 'matchSourceStructure',
        // schemaTemplate: '{{schema}}',
        // tableTemplate: '{{template}}',
    });
    const [canConfirm, setCanConfirm] = useState(true);

    const handleConfirm = () => {
        if (!canConfirm) return;
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
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitleWithClose
                id="destination-layout-dialog-title"
                onClose={onCancel}
            >
                {intl.formatMessage({ id: 'destinationLayout.dialog.title' })}
            </DialogTitleWithClose>

            <DialogContent>
                <TargetNamingFormContent
                    initialStrategy={initialStrategy}
                    onChange={handleChange}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onCancel} color="inherit">
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                >
                    {intl.formatMessage({ id: confirmIntlKey })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
