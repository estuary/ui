import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';

import { Box, Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import TargetNamingDialog from 'src/components/materialization/targetNaming/Dialog';
import {
    buildBothExamples,
    extractStrategyFields,
    VALID_STRATEGY_KEYS,
} from 'src/components/materialization/targetNaming/shared';
import { StrategyOption } from 'src/components/materialization/targetNaming/StrategyOption';
import SpecPropInvalidSetting from 'src/components/shared/specPropEditor/SpecPropInvalidSetting';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

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

    const strategyInvalid =
        !!targetNamingStrategy &&
        !VALID_STRATEGY_KEYS.includes(targetNamingStrategy.strategy);

    const validStrategy =
        targetNamingStrategy && !strategyInvalid ? targetNamingStrategy : null;

    const strategyKey = validStrategy?.strategy as StrategyKey | undefined;

    const { schema, skipCommonDefaults, schemaTemplate, tableTemplate } =
        validStrategy
            ? extractStrategyFields(validStrategy)
            : {
                  schema: '',
                  skipCommonDefaults: true,
                  schemaTemplate: undefined,
                  tableTemplate: undefined,
              };

    const hasCustomNaming = !!schemaTemplate || !!tableTemplate;

    const { example, publicExample } = strategyKey
        ? buildBothExamples(
              strategyKey,
              schema,
              schemaTemplate,
              tableTemplate,
              skipCommonDefaults,
              hasCustomNaming
          )
        : { example: null, publicExample: null };

    return (
        <Stack spacing={1}>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="formSectionHeader">
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

            {strategyInvalid ? (
                <SpecPropInvalidSetting
                    currentSetting={targetNamingStrategy?.strategy}
                    invalidSettingsMessageId="specPropUpdater.error.message"
                    updateDraftedSetting={clearStrategy}
                />
            ) : null}

            <Stack direction="row" spacing={2} alignItems="center">
                {validStrategy && strategyKey && example && publicExample ? (
                    <Box sx={{ maxWidth: 300 }}>
                        <StrategyOption
                            example={null}
                            publicExample={null}
                            readOnly
                            selected
                            value={strategyKey}
                        />
                    </Box>
                ) : (
                    !strategyInvalid && (
                        <Typography color="text.secondary" variant="body2">
                            {intl.formatMessage({
                                id: 'destinationLayout.selected.none',
                            })}
                        </Typography>
                    )
                )}

                <Box>
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={saving || formActive}
                        onClick={openNamingDialog}
                    >
                        {intl.formatMessage({ id: 'cta.modify' })}
                    </Button>
                </Box>
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
