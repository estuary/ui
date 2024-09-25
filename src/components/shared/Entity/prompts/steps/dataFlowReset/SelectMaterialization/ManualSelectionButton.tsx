import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';
import { FormattedMessage } from 'react-intl';
import { useStore } from 'zustand';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function ManualSelectionButton({ toggle }: AddCollectionDialogCTAProps) {
    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const updateContext = usePreSavePromptStore((state) => {
        return state.updateContext;
    });

    const close = async () => {
        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const newCatalog = selectedRow ? selectedRow.catalog_name : null;

        // Only fire updates if a change happened. Since single select table can allow the user
        //   to deselect a row and then select it again
        // if (newCatalog && sourceCapture !== newCatalog) {
        // setBackfillTarget(newCatalog)
        // }

        updateContext({
            backfillTarget: {
                catalog_name: newCatalog,
            },
        });
        toggle(false);
    };

    return (
        <Button variant="contained" onClick={close}>
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default ManualSelectionButton;
