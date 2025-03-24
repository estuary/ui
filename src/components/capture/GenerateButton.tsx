import { Button } from '@mui/material';
import { entityHeaderButtonSx } from 'context/Theme';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBinding_rediscoveryRequired } from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { Entity } from 'types';
import useDiscoverCapture from './useDiscoverCapture';

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

    const processFormData = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        await generateCatalog(event);
    };

    return (
        <Button
            onClick={processFormData}
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
        >
            <FormattedMessage id="cta.generateCatalog.capture" />
        </Button>
    );
}

export default CaptureGenerateButton;
