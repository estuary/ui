import { Button } from '@mui/material';
import type { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import invariableStores from 'context/Zustand/invariableStores';
import useTrialCollections from 'hooks/trialStorage/useTrialCollections';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useBinding_prefillResourceConfigs,
    useBinding_sourceCaptureFlags,
} from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import type { SourceCaptureDef } from 'types';
import { useStore } from 'zustand';
import useSourceCapture from '../useSourceCapture';

function AddSourceCaptureToSpecButton({ toggle }: AddCollectionDialogCTAProps) {
    const [updating, setUpdating] = useState(false);

    const [selected] = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const { existingSourceCapture, updateDraft } = useSourceCapture();
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

    // Binding Store
    const prefillResourceConfigs = useBinding_prefillResourceConfigs();

    const close = async () => {
        setUpdating(true);

        const selectedRow = Array.from(selected).map(([_key, row]) => row)[0];
        const updatedSourceCaptureName = selectedRow
            ? selectedRow.catalog_name
            : null;

        // We need to know if the name or settings changed so that we can control
        //  what name is used in the call to update the source capture setting
        const nameUpdated = Boolean(
            updatedSourceCaptureName &&
                sourceCapture !== updatedSourceCaptureName
        );
        const settingsUpdated =
            (sourceCaptureDeltaUpdatesSupported &&
                deltaUpdates !== existingSourceCapture?.deltaUpdates) ||
            (sourceCaptureTargetSchemaSupported &&
                targetSchema !== existingSourceCapture?.targetSchema);

        // Only update draft is something in the settings changed
        if (nameUpdated || settingsUpdated) {
            const updatedSourceCapture: SourceCaptureDef = {
                capture: nameUpdated ? updatedSourceCaptureName : sourceCapture,
            };

            // Make sure these are support by the connector before
            //  adding to the config
            if (sourceCaptureDeltaUpdatesSupported) {
                updatedSourceCapture.deltaUpdates = deltaUpdates;
            }
            if (sourceCaptureTargetSchemaSupported) {
                updatedSourceCapture.targetSchema = targetSchema;
            }

            // Check the name since the optional settings may
            //  have changed but not the name. Also, we have
            //  already saved the new optional settings in the
            //  store so we do not need to update that here
            if (nameUpdated) {
                setSourceCapture(updatedSourceCapture.capture);

                if (
                    selectedRow?.writes_to &&
                    selectedRow?.writes_to.length > 0
                ) {
                    prefillResourceConfigs(
                        selectedRow.writes_to,
                        true,
                        updatedSourceCapture
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

            await updateDraft(updatedSourceCapture);
        }

        setUpdating(false);
        toggle(false);
    };

    return (
        <Button variant="contained" onClick={close} disabled={updating}>
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default AddSourceCaptureToSpecButton;
