import type { StrategyKey } from 'src/components/materialization/targetNaming/StrategyOption';

import { Box, Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import TargetNamingDialog from 'src/components/materialization/targetNaming/Dialog';
import { ExampleRow } from 'src/components/materialization/targetNaming/ExampleRow';
import {
    buildExample,
    extractStrategyFields,
    hasSchemaTemplate,
    hasTableTemplate,
    isStrategyKeyValid,
    SCHEMA_TEMPLATE_STRING,
    TABLE_TEMPLATE_STRING,
} from 'src/components/materialization/targetNaming/shared';
import { StrategyOption } from 'src/components/materialization/targetNaming/StrategyOption';
import StrategyOptionWrapper from 'src/components/materialization/targetNaming/StrategyOptionWrapper';
import PreformattedBlock from 'src/components/shared/PreformattedBlock';
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
        !isStrategyKeyValid(targetNamingStrategy.strategy);

    const validStrategy =
        targetNamingStrategy && !strategyInvalid ? targetNamingStrategy : null;

    const strategyKey = validStrategy?.strategy as StrategyKey | undefined;

    const { schema, schemaTemplate, tableTemplate, skipCommonDefaults } =
        extractStrategyFields(validStrategy);

    const hasCustomSchema = hasSchemaTemplate(validStrategy);
    const hasCustomTable = hasTableTemplate(validStrategy);
    const hasCustomNaming = !!schema || hasCustomSchema || hasCustomTable;
    const example =
        validStrategy && strategyKey
            ? buildExample(
                  strategyKey,
                  { value: schema, template: schemaTemplate },
                  { template: tableTemplate, skipCommonDefaults },
                  {
                      schema: SCHEMA_TEMPLATE_STRING,
                      table: TABLE_TEMPLATE_STRING,
                  }
              )
            : null;

    const modifyButton = (
        <Button
            size="small"
            variant="outlined"
            disabled={saving || formActive}
            onClick={openNamingDialog}
        >
            {intl.formatMessage({
                id: 'cta.modify',
            })}
        </Button>
    );

    return (
        <Stack spacing={1}>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="formSectionHeader">
                    {intl.formatMessage({
                        id: 'destinationLayout.title',
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

            <Box sx={{ width: 'fit-content', maxWidth: 600 }}>
                {validStrategy && strategyKey ? (
                    <StrategyOption
                        example={null}
                        publicExample={null}
                        readOnly
                        selected
                        value={strategyKey}
                    >
                        <Stack spacing={1}>
                            {hasCustomNaming && example ? (
                                <PreformattedBlock>
                                    <ExampleRow
                                        hideSourceName
                                        outputLayout="column"
                                        example={example}
                                    />
                                </PreformattedBlock>
                            ) : null}

                            <Box sx={{ alignSelf: 'end' }}>{modifyButton}</Box>
                        </Stack>
                    </StrategyOption>
                ) : (
                    !strategyInvalid && (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <StrategyOptionWrapper readOnly selected={false}>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {intl.formatMessage({
                                        id: 'destinationLayout.selected.none',
                                    })}
                                </Typography>
                            </StrategyOptionWrapper>
                            {modifyButton}
                        </Stack>
                    )
                )}
            </Box>

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
