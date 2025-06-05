import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';
import type { SourceCaptureDef } from 'src/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useStore } from 'zustand';

import { FormattedMessage } from 'react-intl';

import invariableStores from 'src/context/Zustand/invariableStores';
import useTrialCollections from 'src/hooks/trialStorage/useTrialCollections';
import {
    useBinding_discoveredCollections,
    useBinding_prefillResourceConfigs,
    useBinding_setRestrictedDiscoveredCollections,
    useBinding_sourceCaptureFlags,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { hasLength } from 'src/utils/misc-utils';

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

    const {
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    } = useBinding_sourceCaptureFlags();

    const [deltaUpdates, targetSchema] = useSourceCaptureStore((state) => [
        state.deltaUpdates,
        state.targetSchema,
    ]);

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

        // Get the SourceCapture settings prepared but ignore
        const sourceCaptureSettings: SourceCaptureDef = {
            // Never use the sourceCapture here because the user is manually adding collections
            //  and we should use their names to base things on
            capture: '',
        };
        if (sourceCaptureDeltaUpdatesSupported) {
            sourceCaptureSettings.deltaUpdates = deltaUpdates;
        }

        if (sourceCaptureTargetSchemaSupported) {
            sourceCaptureSettings.targetNaming = targetSchema;
        }

        const collections = value.map(({ name }) => name);

        prefillResourceConfigs(collections, true, sourceCaptureSettings);

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
