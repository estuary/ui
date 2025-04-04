import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';
import type { SourceCaptureDef } from 'src/types';

import { useRef } from 'react';

import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';

import { useSourceCaptureStore_setSourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

function CancelSourceCaptureButton({ toggle }: AddCollectionDialogCTAProps) {
    // This is here so that we can switch settings back to how they originally were.
    //  Since the Source Capture modal has a 'cancel' button we need to allow the user
    //  to change the optional settings and then click cancel and not change anything
    //  on their draft.
    const settingsCacheHack = useRef<SourceCaptureDef | null>(null);

    const [sourceCapture, deltaUpdates, targetSchema] = useSourceCaptureStore(
        (state) => [state.sourceCapture, state.deltaUpdates, state.targetSchema]
    );
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
        settingsCacheHack.current = {
            capture: sourceCapture ?? '',
            deltaUpdates,
            targetSchema,
        };
    });

    return (
        <Button variant="outlined" onClick={close}>
            <FormattedMessage id="cta.cancel" />
        </Button>
    );
}

export default CancelSourceCaptureButton;
