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

    const setSourceCapture = useStore(
        invariableStores['source-capture'],
        (state) => {
            return state.setSourceCapture;
        }
    );

    const updateDraft = useSourceCapture();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const close = async () => {
        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];

        setSourceCapture(selectedRow.catalog_name);
        setResourceConfig(selectedRow.writes_to, undefined, false, true);

        await updateDraft(selectedRow.catalog_name);

        toggle(false);
    };

    return (
        <Button
            variant="contained"
            disabled={selected.size < 1}
            onClick={close}
        >
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default AddSourceCaptureToSpecButton;
