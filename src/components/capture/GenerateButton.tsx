import { Button } from '@mui/material';
import { buttonSx } from 'components/shared/Entity/Header';
import { FormattedMessage } from 'react-intl';
import { Entity } from 'types';
import useCaptureDiscover from './useCaptureDiscover';

// TODO (typing): Narrow the type annotation attributed to the subscription property.
interface Props {
    entityType: Entity;
    disabled: boolean;
    callFailed: Function;
    postGenerateMutate: Function;
    subscription?: Function; // Not used
}

function CaptureGenerateButton({
    postGenerateMutate,
    entityType,
    disabled,
    callFailed,
}: Props) {
    const { generateCatalog, isSaving, formActive } = useCaptureDiscover(
        entityType,
        disabled,
        callFailed,
        postGenerateMutate
    );

    return (
        <Button
            onClick={generateCatalog}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage id="cta.generateCatalog.capture" />
        </Button>
    );
}

export default CaptureGenerateButton;
