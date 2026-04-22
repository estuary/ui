import { Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DestinationLayoutDialog from 'src/components/materialization/targetNaming/Dialog';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';

const STRATEGY_LABELS: Record<string, string> = {
    matchSourceStructure: 'Match source structure',
    singleSchema: 'All tables in one schema',
    prefixTableNames: 'Prefix table names',
};

// Shown in Advanced Options for rootTargetNaming specs.
// Lets the user re-open the Destination Layout dialog to change their selection.
export default function TargetNamingUpdateWrapper() {
    const intl = useIntl();
    const {
        strategy,
        updateStrategy,
        namingDialogOpen,
        openNamingDialog,
        closeNamingDialog,
    } = useTargetNaming();

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
                    onClick={openNamingDialog}
                >
                    {intl.formatMessage({ id: 'cta.modify' })}
                </Button>
            </Stack>

            {namingDialogOpen ? (
                <DestinationLayoutDialog
                    confirmIntlKey="cta.save"
                    open={namingDialogOpen}
                    initialStrategy={strategy}
                    onCancel={closeNamingDialog}
                    onConfirm={(newStrategy) => {
                        updateStrategy(newStrategy).then(closeNamingDialog);
                    }}
                />
            ) : null}
        </>
    );
}
