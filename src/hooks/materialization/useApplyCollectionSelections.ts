import type { SourceCaptureDef, TargetNamingStrategy } from 'src/types';

import { useShallow } from 'zustand/react/shallow';

import useTrialCollections from 'src/hooks/trialStorage/useTrialCollections';
import {
    useBinding_discoveredCollections,
    useBinding_prefillResourceConfigs,
    useBinding_setRestrictedDiscoveredCollections,
    useBinding_sourceCaptureFlags,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { useTargetNamingStore } from 'src/stores/TargetNaming/Store';
import { hasLength } from 'src/utils/misc-utils';

function useApplyCollectionSelections() {
    const {
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    } = useBinding_sourceCaptureFlags();

    const [deltaUpdates, targetSchema] = useSourceCaptureStore(
        useShallow((state) => [state.deltaUpdates, state.targetSchema])
    );

    const targetNamingModel = useTargetNamingStore((state) => state.model);

    const prefillResourceConfigs = useBinding_prefillResourceConfigs();
    const discoveredCollections = useBinding_discoveredCollections();
    const setRestrictedDiscoveredCollections =
        useBinding_setRestrictedDiscoveredCollections();

    const evaluateTrialCollections = useTrialCollections();
    const setCollectionMetadata = useBindingStore(
        (state) => state.setCollectionMetadata
    );

    return (
        appliedStrategy: TargetNamingStrategy | null | undefined,
        selectedItems: Array<{ catalog_name: string }>,
        sourceCapture?: string
    ) => {
        console.log('selectedItems', selectedItems);

        const collections = selectedItems.map((item) => item.catalog_name);

        const sourceCaptureSettings: SourceCaptureDef = {
            capture: sourceCapture ?? '',
        };
        if (sourceCaptureDeltaUpdatesSupported) {
            sourceCaptureSettings.deltaUpdates = deltaUpdates;
        }

        if (
            sourceCaptureTargetSchemaSupported &&
            targetNamingModel === 'sourceTargetNaming'
        ) {
            sourceCaptureSettings.targetNaming = targetSchema;
        }

        prefillResourceConfigs(
            collections,
            true,
            sourceCaptureSettings,
            targetNamingModel === 'rootTargetNaming'
                ? (appliedStrategy ?? undefined)
                : undefined
        );

        evaluateTrialCollections(collections).then(
            (response) => {
                setCollectionMetadata(response, collections);
            },
            () => {}
        );

        if (collections.length > 0 && hasLength(discoveredCollections)) {
            const latestCollection = collections[collections.length - 1];

            if (discoveredCollections.includes(latestCollection)) {
                setRestrictedDiscoveredCollections(latestCollection);
            }
        }
    };
}

export default useApplyCollectionSelections;
