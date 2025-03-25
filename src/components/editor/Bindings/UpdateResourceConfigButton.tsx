import { Button } from '@mui/material';
import type { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';
import useTrialCollections from 'hooks/trialStorage/useTrialCollections';
import { useState } from 'react';

import { FormattedMessage } from 'react-intl';
import {
    useBinding_discoveredCollections,
    useBinding_prefillResourceConfigs,
    useBinding_setRestrictedDiscoveredCollections,
} from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { hasLength } from 'utils/misc-utils';

import { useStore } from 'zustand';

function UpdateResourceConfigButton({ toggle }: AddCollectionDialogCTAProps) {
    const [updating, setUpdating] = useState(false);

    const [selected] = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const evaluateTrialCollections = useTrialCollections();

    const setCollectionMetadata = useBindingStore(
        (state) => state.setCollectionMetadata
    );

    const prefillResourceConfigs = useBinding_prefillResourceConfigs();
    const discoveredCollections = useBinding_discoveredCollections();

    const setRestrictedDiscoveredCollections =
        useBinding_setRestrictedDiscoveredCollections();

    const close = () => {
        setUpdating(true);

        const value = Array.from(selected).map(([_id, row]) => {
            return {
                name: row.catalog_name,
            };
        });

        const collections = value.map(({ name }) => name);

        prefillResourceConfigs(collections, true);

        evaluateTrialCollections(collections).then(
            (response) => {
                setCollectionMetadata(response, collections);
            },
            () => {}
        );

        if (value.length > 0 && hasLength(discoveredCollections)) {
            const latestCollection = value[value.length - 1].name;

            if (discoveredCollections.includes(latestCollection)) {
                setRestrictedDiscoveredCollections(latestCollection);
            }
        }

        setUpdating(false);
        toggle(false);
    };

    return (
        <Button
            variant="contained"
            disabled={selected.size < 1 || updating}
            onClick={close}
        >
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default UpdateResourceConfigButton;
