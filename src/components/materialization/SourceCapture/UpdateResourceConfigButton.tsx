import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';

import { FormattedMessage } from 'react-intl';
import { useResourceConfig_setResourceConfig } from 'stores/ResourceConfig/hooks';

import { useStore } from 'zustand';

function UpdateResourceConfigButton({ toggle }: AddCollectionDialogCTAProps) {
    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const close = () => {
        setResourceConfig(
            Array.from(selected)
                .map(([_id, row]) => row.writes_to)
                .flat(),
            undefined,
            false,
            true
        );

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

export default UpdateResourceConfigButton;
