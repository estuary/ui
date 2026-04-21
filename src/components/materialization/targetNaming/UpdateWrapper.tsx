import { useState } from 'react';

import { Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DestinationLayoutDialog from 'src/components/materialization/targetNaming/Dialog';
import { useWriteRootTargetNaming } from 'src/hooks/materialization/useWriteRootTargetNaming';
import {
    useTargetNaming_setStrategy,
    useTargetNaming_strategy,
} from 'src/stores/TargetNaming/hooks';

const STRATEGY_LABELS: Record<string, string> = {
    matchSourceStructure: 'Match source structure',
    singleSchema: 'All tables in one schema',
    prefixTableNames: 'Prefix table names',
};

// Shown in Advanced Options for rootTargetNaming specs.
// Lets the user re-open the Destination Layout dialog to change their selection.
export default function TargetNamingUpdateWrapper() {
    const intl = useIntl();
    const [dialogOpen, setDialogOpen] = useState(false);

    const strategy = useTargetNaming_strategy();
    const setStrategy = useTargetNaming_setStrategy();
    const writeRootTargetNaming = useWriteRootTargetNaming();

    const currentLabel = strategy
        ? (STRATEGY_LABELS[strategy.strategy] ?? strategy.strategy)
        : intl.formatMessage({ id: 'destinationLayout.dialog.title' });

    return (
        <>
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="formSectionHeader">
                    {intl.formatMessage({
                        id: 'destinationLayout.dialog.title',
                    })}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {currentLabel}
                </Typography>

                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setDialogOpen(true)}
                >
                    {intl.formatMessage({ id: 'cta.edit' })}
                </Button>
            </Stack>

            <DestinationLayoutDialog
                confirmIntlKey="cta.save"
                open={dialogOpen}
                initialStrategy={strategy}
                onCancel={() => setDialogOpen(false)}
                onConfirm={(newStrategy) => {
                    setStrategy(newStrategy);
                    writeRootTargetNaming(newStrategy);
                    setDialogOpen(false);
                }}
            />
        </>
    );
}
