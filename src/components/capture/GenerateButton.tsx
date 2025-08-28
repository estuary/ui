import type { Dispatch, SetStateAction } from 'react';
import type { Entity } from 'src/types';

import { useEffect } from 'react';

import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import useDiscoverCapture from 'src/components/capture/useDiscoverCapture';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useBinding_rediscoveryRequired } from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface Props {
    entityType: Entity;
    disabled: boolean;
    createWorkflowMetadata?: {
        initiateDiscovery: boolean;
        setInitiateDiscovery: Dispatch<SetStateAction<boolean>>;
    };
}

function CaptureGenerateButton({
    entityType,
    disabled,
    createWorkflowMetadata,
}: Props) {
    const isEdit = useEntityWorkflow_Editing();
    const rediscoveryRequired = useBinding_rediscoveryRequired();

    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        {
            // We only want to set updateOnly if the user is editing and not updating the config
            //  This should cover when a user has enable previously disabled collection(s)
            updateOnly: createWorkflowMetadata?.initiateDiscovery
                ? false
                : Boolean(isEdit && rediscoveryRequired),
            initiateDiscovery: createWorkflowMetadata?.initiateDiscovery,
            initiateRediscovery: rediscoveryRequired,
        }
    );

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

                void generateCatalog();
            }}
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
        >
            <FormattedMessage id="cta.generateCatalog.capture" />
        </Button>
    );
}

export default CaptureGenerateButton;
