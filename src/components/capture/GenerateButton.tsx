import { Button } from '@mui/material';
import { buttonSx } from 'components/shared/Entity/Header';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_entityNameChanged,
    useDetailsForm_previousConnectorImage_connectorId,
} from 'stores/DetailsForm/hooks';
import { useEndpointConfigStore_changed } from 'stores/EndpointConfig/hooks';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useResourceConfig_rediscoveryRequired } from 'stores/ResourceConfig/hooks';
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
    const endpointConfigChanged = useEndpointConfigStore_changed();
    const rediscoveryRequired = useResourceConfig_rediscoveryRequired();

    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        {
            // We only want to set updateOnly if the user is editing and not updating the config
            //  This should cover when a user has enable previously disabled collection(s)
            updateOnly: Boolean(
                rediscoveryRequired && isEdit && !endpointConfigChanged
            ),
            initiateDiscovery: createWorkflowMetadata?.initiateDiscovery,
            initiateRediscovery: rediscoveryRequired,
        }
    );

    // Details Form Store
    const selectedConnectorId = useDetailsForm_connectorImage_connectorId();
    const previousConnectorId =
        useDetailsForm_previousConnectorImage_connectorId();
    const entityNameChanged = useDetailsForm_entityNameChanged();

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
            sx={buttonSx}
        >
            <FormattedMessage id="cta.generateCatalog.capture" />
        </Button>
    );
}

export default CaptureGenerateButton;
