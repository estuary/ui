import { Button } from '@mui/material';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import { useRef } from 'react';

import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';

import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { SourceCaptureDef } from 'types';

function CancelSourceCaptureButton({ toggle }: AddCollectionDialogCTAProps) {
    const settingsCacheHack = useRef<SourceCaptureDef | null>(null);

    const [
        sourceCapture,
        deltaUpdates,
        targetSchema,
        setSourceCapture,
        setDeltaUpdates,
        setTargetSchema,
    ] = useSourceCaptureStore((state) => [
        state.sourceCapture,
        state.deltaUpdates,
        state.targetSchema,
        state.setSourceCapture,
        state.setDeltaUpdates,
        state.setTargetSchema,
    ]);

    const close = async () => {
        if (settingsCacheHack.current) {
            setSourceCapture(
                settingsCacheHack.current.capture.length > 0
                    ? settingsCacheHack.current.capture
                    : null
            );
            setDeltaUpdates(settingsCacheHack.current.deltaUpdates);
            setTargetSchema(settingsCacheHack.current.targetSchema);
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
        <Button variant="contained" onClick={close}>
            <FormattedMessage id="cta.cancel" />
        </Button>
    );
}

export default CancelSourceCaptureButton;
