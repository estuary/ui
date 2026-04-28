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
import useSourceCapture from 'src/hooks/sourceCapture/useSourceCapture';
import useTrialCollections from 'src/hooks/trialStorage/useTrialCollections';
import {
    useBinding_prefillResourceConfigs,
    useBinding_sourceCaptureFlags,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

function AddSourceCaptureToSpecButton({ toggle }: AddCollectionDialogCTAProps) {
    const [updating, setUpdating] = useState(false);

    const [selected] = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const { updateDraft } = useSourceCapture();
    const evaluateTrialCollections = useTrialCollections();

    const setCollectionMetadata = useBindingStore(
        (state) => state.setCollectionMetadata
    );
    const {
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    } = useBinding_sourceCaptureFlags();

    const [sourceCapture, setSourceCapture, deltaUpdates, targetSchema] =
        useSourceCaptureStore((state) => [
            state.sourceCapture,
            state.setSourceCapture,
            state.deltaUpdates,
            state.targetSchema,
        ]);

    const confirmationContext = useConfirmationModalContext();

    const {
        model: targetNamingModel,
        targetNamingStrategy,
        needsNamingDialog,
        handleConfirm,
    } = useTargetNaming();

    // Binding Store
    const prefillResourceConfigs = useBinding_prefillResourceConfigs();

    // appliedStrategy is passed explicitly when the naming dialog was just confirmed
    // so we don't rely on a stale store closure.
    const applySourceCapture = async (
        appliedStrategy?: TargetNamingStrategy | null
    ) => {
        setUpdating(true);

        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const updatedSourceCaptureName = selectedRow
            ? selectedRow.catalog_name
            : null;

        const nameUpdated = Boolean(
            updatedSourceCaptureName &&
                sourceCapture !== updatedSourceCaptureName
        );

        if (nameUpdated) {
            const updatedSourceCapture: SourceCaptureDef = {
                capture: nameUpdated ? updatedSourceCaptureName : sourceCapture,
            };

            if (sourceCaptureDeltaUpdatesSupported) {
                updatedSourceCapture.deltaUpdates = deltaUpdates;
            }
            // For sourceTargetNaming model, keep passing targetNaming on the source object
            if (
                sourceCaptureTargetSchemaSupported &&
                targetNamingModel === 'sourceTargetNaming'
            ) {
                updatedSourceCapture.targetNaming = targetSchema;
            }

            if (nameUpdated) {
                setSourceCapture(updatedSourceCapture.capture);

                if (
                    selectedRow?.writes_to &&
                    selectedRow?.writes_to.length > 0
                ) {
                    prefillResourceConfigs(
                        selectedRow.writes_to,
                        true,
                        updatedSourceCapture,
                        targetNamingModel === 'rootTargetNaming'
                            ? (appliedStrategy ??
                                  targetNamingStrategy ??
                                  undefined)
                            : undefined
                    );

                    const trialCollectionResponse =
                        await evaluateTrialCollections(
                            selectedRow.writes_to as string[]
                        );

                    setCollectionMetadata(
                        trialCollectionResponse,
                        selectedRow.writes_to as string[]
                    );
                }
            }

            await updateDraft(updatedSourceCapture.capture);
        }

        setUpdating(false);
        toggle(false);
    };

    const handleContinue = async () => {
        if (needsNamingDialog) {
            let pendingStrategy: Parameters<typeof handleConfirm>[0] = {
                strategy: 'matchSourceStructure',
                // schemaTemplate: '{{schema}}',
                // tableTemplate: '{{template}}',
            };

            const selectedRow = Array.from(selected).map(
                ([_key, row]) => row
            )[0];
            const exampleCollections =
                (selectedRow?.writes_to as string[] | undefined) ?? [];

            const confirmed = await confirmationContext?.showConfirmation(
                {
                    title: 'destinationLayout.dialog.title',
                    confirmText: 'destinationLayout.dialog.cta.sourceCapture',
                    dialogProps: {
                        maxWidth: 'md',
                    },
                    message: (
                        <TargetNamingFormContent
                            initialStrategy={targetNamingStrategy}
                            exampleCollections={exampleCollections}
                            onChange={(strategy, isValid) => {
                                pendingStrategy = strategy;
                                confirmationContext.setContinueAllowed(isValid);
                            }}
                        />
                    ),
                },
                true
            );

            if (!confirmed) return;
            await handleConfirm(pendingStrategy, () =>
                applySourceCapture(pendingStrategy)
            );
            return;
        }
        await applySourceCapture();
    };

    return (
        <Button
            variant="contained"
            onClick={handleContinue}
            disabled={updating}
        >
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default AddSourceCaptureToSpecButton;
