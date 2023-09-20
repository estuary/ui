import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';

import { FormattedMessage } from 'react-intl';
import { useResourceConfig_setResourceConfig } from 'stores/ResourceConfig/hooks';

import { useStore } from 'zustand';
import useSourceCapture from '../useSourceCapture';

function AddSourceCaptureToSpecButton({ toggle }: AddCollectionDialogCTAProps) {
    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const [sourceCapture, setSourceCapture] = useStore(
        invariableStores['source-capture'],
        (state) => {
            return [state.sourceCapture, state.setSourceCapture];
        }
    );

    const updateDraft = useSourceCapture();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const close = async () => {
        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const updatedSourceCapture = selectedRow
            ? selectedRow.catalog_name
            : null;

        // Only fire updates if a change happened. Since single select table can allow the user
        //   to deselect a row and then select it again
        if (sourceCapture !== updatedSourceCapture) {
            setSourceCapture(updatedSourceCapture);

            if (selectedRow?.writes_to) {
                setResourceConfig(
                    selectedRow.writes_to,
                    undefined,
                    false,
                    true
                );
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
