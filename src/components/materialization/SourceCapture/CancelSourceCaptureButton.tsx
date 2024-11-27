import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import { useRef } from 'react';

import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';
import {
    useSourceCaptureStore_setSourceCaptureDefinition,
    useSourceCaptureStore_sourceCaptureDefinition,
} from 'stores/SourceCapture/hooks';

import { SourceCaptureDef } from 'types';

function CancelSourceCaptureButton({ toggle }: AddCollectionDialogCTAProps) {
    const settingsCacheHack = useRef<SourceCaptureDef | null>(null);

    const sourceCaptureDefinition =
        useSourceCaptureStore_sourceCaptureDefinition();
    const setSourceCaptureDefinition =
        useSourceCaptureStore_setSourceCaptureDefinition();

    const close = async () => {
        if (settingsCacheHack.current) {
            if (settingsCacheHack.current.capture.length > 0) {
                setSourceCaptureDefinition(settingsCacheHack.current);
            } else {
                setSourceCaptureDefinition(null);
            }
        }

        toggle(false);
    };

    useMount(() => {
        settingsCacheHack.current = sourceCaptureDefinition;
    });

    return (
        <Button variant="contained" onClick={close}>
            <FormattedMessage id="cta.cancel" />
        </Button>
    );
}

export default CancelSourceCaptureButton;
