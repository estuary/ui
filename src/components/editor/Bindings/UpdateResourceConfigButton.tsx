import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';
import type { SourceCaptureDef, TargetNamingStrategy } from 'src/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useStore } from 'zustand';

import { FormattedMessage } from 'react-intl';

import { TargetNamingFormContent } from 'src/components/materialization/targetNaming/FormContent';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import invariableStores from 'src/context/Zustand/invariableStores';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';
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

    const confirmationContext = useConfirmationModalContext();

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

    const {
        model: targetNamingModel,
        targetNamingStrategy,
        needsNamingDialog,
        handleConfirm,
    } = useTargetNaming();

    const prefillResourceConfigs = useBinding_prefillResourceConfigs();
    const discoveredCollections = useBinding_discoveredCollections();

    const setRestrictedDiscoveredCollections =
        useBinding_setRestrictedDiscoveredCollections();

    // Pass appliedStrategy explicitly so the caller can provide the just-confirmed
    // value without relying on a stale store closure.
    const close = (
        appliedStrategy: TargetNamingStrategy | null | undefined
    ) => {
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

        // Only pass targetNaming on the sourceCapture object for the old model.
        // For rootTargetNaming the strategy is passed directly to WASM (handled in generateMaterializationResourceSpec).
        if (
            sourceCaptureTargetSchemaSupported &&
            targetNamingModel === 'sourceTargetNaming'
        ) {
            sourceCaptureSettings.targetNaming = targetSchema;
        }

        const collections = value.map(({ name }) => name);

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

        if (value.length > 0 && hasLength(discoveredCollections)) {
            const latestCollection = value[value.length - 1].name;

            if (discoveredCollections.includes(latestCollection)) {
                setRestrictedDiscoveredCollections(latestCollection);
            }
        }

        setUpdating(false);
        toggle(false);
    };

    const handleContinue = async () => {
        if (needsNamingDialog) {
            let defaultStrategy: TargetNamingStrategy = {
                strategy: 'matchSourceStructure',
                // schemaTemplate: '{{schema}}',
                // tableTemplate: '{{template}}',
            };

            const exampleCollections = Array.from(selected).map(
                ([_id, row]) => row.catalog_name
            );

            const confirmed = await confirmationContext?.showConfirmation(
                {
                    title: 'destinationLayout.dialog.title',
                    confirmText: 'destinationLayout.dialog.cta.addBindings',
                    dialogProps: {
                        maxWidth: 'md',
                    },
                    message: (
                        <TargetNamingFormContent
                            initialStrategy={targetNamingStrategy}
                            exampleCollections={exampleCollections}
                            onChange={(strategy, isValid) => {
                                defaultStrategy = strategy;
                                confirmationContext.setContinueAllowed(isValid);
                            }}
                        />
                    ),
                },
                true
            );

            if (!confirmed) return;
            await handleConfirm(defaultStrategy, () => close(defaultStrategy));
            return;
        }
        close(targetNamingStrategy);
    };

    return (
        <Button
            variant="contained"
            disabled={selected.size < 1 || updating}
            onClick={handleContinue}
        >
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default UpdateResourceConfigButton;
