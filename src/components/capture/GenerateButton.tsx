import { Button } from '@mui/material';
import { buttonSx } from 'components/shared/Entity/Header';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
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

    const processFormData = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        await generateCatalog(event);

        if (createWorkflowMetadata?.initiateDiscovery) {
            createWorkflowMetadata.setInitiateDiscovery(false);
        }
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
