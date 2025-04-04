import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';

import { Button } from '@mui/material';

import { useStore } from 'zustand';

import { FormattedMessage } from 'react-intl';

import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';
import invariableStores from 'src/context/Zustand/invariableStores';
import { useBinding_collectionsBeingBackfilled } from 'src/stores/Binding/hooks';

function ManualSelectionButton({ toggle }: AddCollectionDialogCTAProps) {
    const stepIndex = useLoopIndex();

    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();

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
        const newReadsFrom = selectedRow ? selectedRow.reads_from : null;

        if (newCatalog && newReadsFrom) {
            const targetHasOverlap = collectionsBeingBackfilled.some(
                (collection) => newReadsFrom.includes(collection)
            );

            updateContext({
                backfillTarget: {
                    catalog_name: newCatalog,
                    id: newId,
                    reads_from: newReadsFrom,
                },
                targetHasOverlap,
            });
            updateStep(stepIndex, {
                valid: Boolean(newCatalog && targetHasOverlap),
            });
        }

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
