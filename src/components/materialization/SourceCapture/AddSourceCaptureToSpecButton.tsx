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
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const [sourceCapture, setSourceCapture, deltaUpdates, targetSchema] =
        useSourceCaptureStore((state) => [
            state.sourceCapture,
            state.setSourceCapture,
            state.deltaUpdates,
            state.targetSchema,
        ]);

    const updateDraft = useSourceCapture();

    // Binding Store
    const prefillResourceConfigs = useBinding_prefillResourceConfigs();

    const close = async () => {
        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const updatedSourceCapture = selectedRow
            ? selectedRow.catalog_name
            : null;

        // TODO (source capture) need to check ALL the SourceCaptureDef settings to see if any
        //  of them changed

        // Only fire updates if a change happened. Since single select table can allow the user
        //   to deselect a row and then select it again
        if (updatedSourceCapture && sourceCapture !== updatedSourceCapture) {
            setSourceCapture(updatedSourceCapture);

            if (selectedRow?.writes_to) {
                // TODO (source capture) need to use the new WASM stuff to set
                //  defaults of bindings properly
                prefillResourceConfigs(selectedRow.writes_to, true);
            }

            await updateDraft({
                capture: updatedSourceCapture,
                deltaUpdates,
                targetSchema,
            });
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
