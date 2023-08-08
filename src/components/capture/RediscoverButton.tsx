import { Button } from '@mui/material';
import useDiscoverCapture from 'components/capture/useDiscoverCapture';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { FormattedMessage } from 'react-intl';
import { Entity } from 'types';

interface Props {
    entityType: Entity;
    disabled: boolean;
    postGenerateMutate: Function;
}

function RediscoverButton({ entityType, disabled, postGenerateMutate }: Props) {
    const { callFailed } = useEntityWorkflowHelpers();

    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        callFailed,
        postGenerateMutate,
        { initiateRediscovery: true }
    );

    return (
        <Button
            variant="text"
            disabled={disabled || isSaving || formActive}
            onClick={generateCatalog}
            sx={{ borderRadius: 0 }}
        >
            <FormattedMessage id="workflows.collectionSelector.cta.rediscover" />
        </Button>
    );
}

export default RediscoverButton;
