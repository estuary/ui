import type { Dispatch, SetStateAction } from 'react';

import { useEffect } from 'react';

import { Button } from '@mui/material';

import { useSubmitCaptureForm } from 'src/components/capture/useSubmitCaptureForm';
import { useEditorStore_isSaving } from 'src/components/editor/Store/hooks';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { useBinding_rediscoveryRequired } from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface Props {
    createWorkflowMetadata?: {
        initiateDiscovery: boolean;
        setInitiateDiscovery: Dispatch<SetStateAction<boolean>>;
    };
}

function CaptureGenerateButton({ createWorkflowMetadata }: Props) {
    // Details Form Store
    const selectedConnectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );
    const previousConnectorId = useDetailsFormStore(
        (state) => state.previousDetails.data.connectorImage.connectorId
    );
    const entityNameChanged = useDetailsFormStore(
        (state) => state.entityNameChanged
    );
    // Form State Store
    const formStatus = useFormStateStore_status();

    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const rediscoveryRequired = useBinding_rediscoveryRequired();

    const submitForm = useSubmitCaptureForm({
        initiateDiscovery: createWorkflowMetadata?.initiateDiscovery,
        initiateRediscovery: rediscoveryRequired,
    });

    useEffect(() => {
        if (createWorkflowMetadata?.initiateDiscovery) {
            if (
                !entityNameChanged &&
                formStatus === FormStatus.GENERATED &&
                selectedConnectorId === previousConnectorId
            ) {
                createWorkflowMetadata.setInitiateDiscovery(false);
            }
        }
    }, [
        entityNameChanged,
        createWorkflowMetadata,
        formStatus,
        previousConnectorId,
        selectedConnectorId,
    ]);

    return (
        <Button
            onClick={(event) => {
                event.preventDefault();

                void submitForm();
            }}
            disabled={isSaving || formActive}
            sx={entityHeaderButtonSx}
        >
            Next
        </Button>
    );
}

export default CaptureGenerateButton;
