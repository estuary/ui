import { Button } from '@mui/material';
import { usePreSavePromptStore } from 'components/shared/Entity/prompts/store/usePreSavePromptStore';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import invariableStores from 'context/Zustand/invariableStores';
import { FormattedMessage } from 'react-intl';
import { useStore } from 'zustand';

function ManualSelectionButton({ toggle }: AddCollectionDialogCTAProps) {
    const stepIndex = useLoopIndex();

    const [selected, resetSelected] = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return [state.selected, state.resetSelected];
        }
    );

    const [updateStep, updateContext] = usePreSavePromptStore((state) => {
        return [state.updateStep, state.updateContext];
    });

    const close = async () => {
        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const newCatalog = selectedRow ? selectedRow.catalog_name : null;
        const newId = selectedRow ? selectedRow.id : null;

        // TODO (data flow reset)
        // need to update the context properly
        updateContext({
            backfillTarget: {
                catalog_name: newCatalog,
                id: newId,
            },
        });
        updateStep(stepIndex, {
            valid: Boolean(newCatalog),
        });
        resetSelected();
        toggle(false);
    };

    return (
        <Button variant="contained" onClick={close}>
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default ManualSelectionButton;
