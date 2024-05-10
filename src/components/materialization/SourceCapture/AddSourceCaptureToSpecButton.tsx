import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';

import { FormattedMessage } from 'react-intl';

import { useBinding_prefillResourceConfigs } from 'stores/Binding/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { useStore } from 'zustand';
import useSourceCapture from '../useSourceCapture';

function AddSourceCaptureToSpecButton({ toggle }: AddCollectionDialogCTAProps) {
    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const [sourceCapture, setSourceCapture] = useSourceCaptureStore((state) => [
        state.sourceCapture,
        state.setSourceCapture,
    ]);

    const updateDraft = useSourceCapture();

    // Binding Store
    const prefillResourceConfigs = useBinding_prefillResourceConfigs();

    const close = async () => {
        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const updatedSourceCapture = selectedRow
            ? selectedRow.catalog_name
            : null;

        // Only update when the udpatedSourceCapture is null if there was a previous sourceCapture
        // otherwise if a user opens the dialog, has something preselected, and then clicks continue the
        //  option that was preselected will be removed. Because the preselection does not count as
        //  a "selectedRow"
        if (!updatedSourceCapture && sourceCapture) {
            setSourceCapture(updatedSourceCapture);
        } else if (
            updatedSourceCapture &&
            sourceCapture !== updatedSourceCapture
        ) {
            // Only fire updates if a change happened. Since single select table can allow the user
            //   to deselect a row and then select it again
            setSourceCapture(updatedSourceCapture);

            if (selectedRow?.writes_to) {
                prefillResourceConfigs(selectedRow.writes_to, true);
            }

            await updateDraft(updatedSourceCapture);
        }
        toggle(false);
    };

    return (
        <Button variant="contained" onClick={close}>
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default AddSourceCaptureToSpecButton;
