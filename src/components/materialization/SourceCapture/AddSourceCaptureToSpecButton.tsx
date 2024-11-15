import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';
import { isEqual } from 'lodash';

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

    const { existingSourceCapture, updateDraft } = useSourceCapture();

    // Binding Store
    const prefillResourceConfigs = useBinding_prefillResourceConfigs();

    const close = async () => {
        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const updatedSourceCapture = {
            capture: selectedRow ? selectedRow.catalog_name : null,
            deltaUpdates,
            targetSchema,
        };

        // Only update draft is something in the settings changed
        if (!isEqual(updatedSourceCapture, existingSourceCapture)) {
            // Check the name since the optional settings may
            //  have changed but not the name
            if (
                updatedSourceCapture.capture &&
                sourceCapture !== updatedSourceCapture.capture
            ) {
                setSourceCapture(updatedSourceCapture.capture);

                if (selectedRow?.writes_to) {
                    prefillResourceConfigs(
                        selectedRow.writes_to,
                        true,
                        updatedSourceCapture
                    );
                }
            }

            await updateDraft(updatedSourceCapture.capture);
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
