import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';
import type { SourceCaptureDef } from 'src/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useStore } from 'zustand';

import { FormattedMessage } from 'react-intl';

import DestinationLayoutDialog from 'src/components/materialization/targetNaming/Dialog';
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

    const {
        model: targetNamingModel,
        strategy: targetNamingStrategy,
        needsNamingDialog,
        handleConfirm,
        namingDialogOpen,
        openNamingDialog,
        closeNamingDialog,
    } = useTargetNaming();

    // Binding Store
    const prefillResourceConfigs = useBinding_prefillResourceConfigs();

    const applySourceCapture = async () => {
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
                            ? (targetNamingStrategy ?? undefined)
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

    const handleContinue = () => {
        if (needsNamingDialog) {
            openNamingDialog();
        } else {
            applySourceCapture();
        }
    };

    return (
        <>
            <Button
                variant="contained"
                onClick={handleContinue}
                disabled={updating}
            >
                <FormattedMessage id="cta.continue" />
            </Button>

            {namingDialogOpen ? (
                <DestinationLayoutDialog
                    confirmIntlKey="destinationLayout.dialog.cta.sourceCapture"
                    open={namingDialogOpen}
                    initialStrategy={targetNamingStrategy}
                    onCancel={closeNamingDialog}
                    onConfirm={(strategy) =>
                        handleConfirm(strategy, applySourceCapture)
                    }
                />
            ) : null}
        </>
    );
}

export default AddSourceCaptureToSpecButton;
