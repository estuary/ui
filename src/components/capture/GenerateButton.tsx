import { Button } from '@mui/material';
import { buttonSx } from 'components/shared/Entity/Header';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { Entity } from 'types';
import useDiscoverCapture from './useDiscoverCapture';

interface Props {
    entityType: Entity;
    disabled: boolean;
    callFailed: Function;
    postGenerateMutate: Function;
    createWorkflowMetadata?: {
        initiateDiscovery: boolean;
        setInitiateDiscovery: Dispatch<SetStateAction<boolean>>;
    };
}

function CaptureGenerateButton({
    entityType,
    disabled,
    callFailed,
    postGenerateMutate,
    createWorkflowMetadata,
}: Props) {
    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        callFailed,
        postGenerateMutate,
        { initiateDiscovery: createWorkflowMetadata?.initiateDiscovery }
    );

    const formStatus = useFormStateStore_status();
    useEffect(() => {
        if (createWorkflowMetadata?.initiateDiscovery) {
            if (formStatus === FormStatus.GENERATED) {
                createWorkflowMetadata.setInitiateDiscovery(false);
            }
        }
    }, [createWorkflowMetadata, formStatus]);

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
