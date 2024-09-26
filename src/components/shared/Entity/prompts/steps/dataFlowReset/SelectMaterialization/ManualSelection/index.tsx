import { Button, Stack, Tooltip } from '@mui/material';
import AddDialog from 'components/shared/Entity/AddDialog';
import { usePreSavePromptStore } from 'components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import ManualSelectionButton from './Button';
import SelectedChip from './SelectedChip';

const DIALOG_ID = 'add-materialization-search-dialog';

function ManualSelection() {
    const intl = useIntl();
    // const entityType = useEntityType();

    const [open, setOpen] = useState<boolean>(false);

    const backfillTarget = usePreSavePromptStore((state) => {
        return state.context.backfillTarget;
    });

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
        // resetSelected();
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    return (
        <>
            <Stack direction="row" spacing={2}>
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
                primaryCTA={ManualSelectionButton}
                selectedCollections={
                    backfillTarget ? [backfillTarget.catalog_name] : []
                }
                toggle={toggleDialog}
                title={itemType}
            />
        </>
    );
}

export default ManualSelection;
