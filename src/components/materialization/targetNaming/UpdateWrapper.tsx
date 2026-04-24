import { Box, Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import TargetNamingDialog from 'src/components/materialization/targetNaming/Dialog';
import { truncateTextSx } from 'src/context/Theme';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

const STRATEGY_INTL_KEYS: Record<string, string> = {
    matchSourceStructure:
        'destinationLayout.strategy.matchSourceStructure.label',
    singleSchema: 'destinationLayout.strategy.singleSchema.label',
    prefixTableNames: 'destinationLayout.strategy.prefixTableNames.label',
};

// Shown in Advanced Options for rootTargetNaming specs.
// Lets the user re-open the Destination Layout dialog to change their selection.
export default function TargetNamingUpdateWrapper() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const {
        targetNamingStrategy,
        saving,
        handleConfirm,
        clearStrategy,
        targetNamingDialogOpen,
        openNamingDialog,
        closeNamingDialog,
    } = useTargetNaming();

    const strategyIntlKey = targetNamingStrategy
        ? (STRATEGY_INTL_KEYS[targetNamingStrategy.strategy] ?? null)
        : null;

    const label = strategyIntlKey
        ? intl.formatMessage({ id: strategyIntlKey })
        : (targetNamingStrategy?.strategy ??
          intl.formatMessage({ id: 'destinationLayout.selected.none' }));

    return (
        <Stack spacing={1}>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography style={{ fontWeight: 500 }}>
                    {intl.formatMessage({
                        id: 'destinationLayout.dialog.title',
                    })}
                </Typography>

                <Typography>
                    {intl.formatMessage({
                        id: 'destinationLayout.dialog.message',
                    })}
                </Typography>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <OutlinedChip
                    color={targetNamingStrategy ? 'success' : 'info'}
                    disabled={saving || formActive}
                    label={
                        <Box sx={{ ...truncateTextSx, minWidth: 100, p: 1 }}>
                            {label}
                        </Box>
                    }
                    onDelete={
                        targetNamingStrategy
                            ? () => {
                                  void clearStrategy();
                              }
                            : undefined
                    }
                    style={{ maxWidth: '50%', minHeight: 40 }}
                    variant="outlined"
                />

                <Button
                    size="small"
                    variant="outlined"
                    disabled={saving || formActive}
                    onClick={openNamingDialog}
                >
                    {intl.formatMessage({ id: 'cta.modify' })}
                </Button>
            </Stack>

            {targetNamingDialogOpen ? (
                <TargetNamingDialog
                    confirmIntlKey="cta.save"
                    open={targetNamingDialogOpen}
                    initialStrategy={targetNamingStrategy}
                    onCancel={closeNamingDialog}
                    onConfirm={handleConfirm}
                />
            ) : null}
        </Stack>
    );
}
