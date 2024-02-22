import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';

import { FormattedMessage } from 'react-intl';
import {
    useBinding_discoveredCollections,
    useBinding_setResourceConfig,
    useBinding_setRestrictedDiscoveredCollections,
} from 'stores/Binding/hooks';
import { hasLength } from 'utils/misc-utils';

import { useStore } from 'zustand';

function UpdateResourceConfigButton({ toggle }: AddCollectionDialogCTAProps) {
    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const setResourceConfig = useBinding_setResourceConfig();
    const discoveredCollections = useBinding_discoveredCollections();

    const setRestrictedDiscoveredCollections =
        useBinding_setRestrictedDiscoveredCollections();

    const close = () => {
        const value = Array.from(selected).map(([_id, row]) => {
            return {
                name: row.catalog_name,
            };
        });

        setResourceConfig(
            value.map(({ name }) => name),
            undefined,
            undefined,
            false,
            true
        );

        if (value.length > 0 && hasLength(discoveredCollections)) {
            const latestCollection = value[value.length - 1].name;

            if (discoveredCollections.includes(latestCollection)) {
                setRestrictedDiscoveredCollections(latestCollection);
            }
        }

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
