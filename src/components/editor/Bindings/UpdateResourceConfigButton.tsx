import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';

import { FormattedMessage } from 'react-intl';
import {
    useBinding_currentCollection,
    useBinding_resourceSchema,
} from 'stores/Binding/hooks';
import {
    useResourceConfig_discoveredCollections,
    useResourceConfig_setResourceConfig,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';

import { useStore } from 'zustand';

function UpdateResourceConfigButton({ toggle }: AddCollectionDialogCTAProps) {
    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const resourceSchema = useBinding_resourceSchema();
    const currentCollection = useBinding_currentCollection();

    const discoveredCollections = useResourceConfig_discoveredCollections();
    const setResourceConfig = useResourceConfig_setResourceConfig();
    const setRestrictedDiscoveredCollections =
        useResourceConfig_setRestrictedDiscoveredCollections();

    const close = () => {
        const value = Array.from(selected).map(([_id, row]) => {
            return {
                name: row.catalog_name,
            };
        });

        setResourceConfig(
            value.map(({ name }) => name),
            resourceSchema,
            currentCollection,
            undefined,
            false,
            true
        );

        if (value.length > 0 && discoveredCollections) {
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
