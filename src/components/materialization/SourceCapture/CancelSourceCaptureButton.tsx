import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';

import { FormattedMessage } from 'react-intl';

import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import useSourceCapture from '../useSourceCapture';

function CancelSourceCaptureButton({ toggle }: AddCollectionDialogCTAProps) {
    const [setSourceCapture, setDeltaUpdates, setTargetSchema] =
        useSourceCaptureStore((state) => [
            state.setSourceCapture,
            state.setDeltaUpdates,
            state.setTargetSchema,
        ]);

    const { existingSourceCapture } = useSourceCapture();

    const close = async () => {
        // TODO (source capture)
        // This needs to "undo" the changes
        if (existingSourceCapture) {
            setSourceCapture(existingSourceCapture.capture);
            setDeltaUpdates(existingSourceCapture.deltaUpdates ?? false);
            setTargetSchema(existingSourceCapture.targetSchema ?? 'leaveEmpty');
        }

        toggle(false);
    };

    return (
        <Button variant="contained" onClick={close}>
            <FormattedMessage id="cta.cancel" />
        </Button>
    );
}

export default CancelSourceCaptureButton;
