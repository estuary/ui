import { useState } from 'react';

import { Button, Stack, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import AddDialog from 'src/components/shared/Entity/AddDialog';
import ManualSelectionButton from 'src/components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization/ManualSelection/Button';
import SelectedChip from 'src/components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization/ManualSelection/SelectedChip';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';

const DIALOG_ID = 'add-materialization-search-dialog';

function ManualSelection() {
    const intl = useIntl();

    const [open, setOpen] = useState<boolean>(false);

    const [backfillTarget, targetHasOverlap] = usePreSavePromptStore(
        (state) => [
            state.context.backfillTarget,
            state.context.targetHasOverlap,
        ]
    );

    const itemType = intl.formatMessage({
        id: 'terms.materialization',
    });

    const tooltip = intl.formatMessage(
        {
            id: 'entityCreate.bindingsConfig.addCTA',
        },
        {
            itemType,
        }
    );

    const toggleDialog = (args: any) => {
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    return (
        <Stack spacing={2}>
            {backfillTarget?.catalog_name && !targetHasOverlap ? (
                <AlertBox
                    short
                    severity="error"
                    title={intl.formatMessage({
                        id: 'resetDataFlow.materializations.noOverlap.title',
                    })}
                >
                    {intl.formatMessage({
                        id: 'resetDataFlow.materializations.noOverlap.message',
                    })}
                </AlertBox>
            ) : null}

            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: 'center',
                }}
            >
                <Tooltip placement="top" title={tooltip}>
                    <Button
                        aria-controls={open ? DIALOG_ID : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={toggleDialog}
                        sx={{ borderRadius: 0 }}
                    >
                        {intl.formatMessage({ id: 'cta.manualSelect' })}
                    </Button>
                </Tooltip>

                <SelectedChip />
            </Stack>
            <AddDialog
                entity="materialization"
                id={DIALOG_ID}
                open={open}
                PrimaryCTA={ManualSelectionButton}
                selectedCollections={
                    backfillTarget ? [backfillTarget.catalog_name] : []
                }
                toggle={toggleDialog}
                title={itemType}
            />
        </Stack>
    );
}

export default ManualSelection;
