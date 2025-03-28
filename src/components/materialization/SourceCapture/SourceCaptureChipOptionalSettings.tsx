import SourceCaptureChipOption from './SourceCaptureChipOption';

import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';
import { useSourceCaptureStore_sourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';

function SourceCaptureChipOptionalSettings() {
    const sourceCaptureDefinition =
        useSourceCaptureStore_sourceCaptureDefinition();

    const {
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    } = useBinding_sourceCaptureFlags();

    if (
        (sourceCaptureDeltaUpdatesSupported ||
            sourceCaptureTargetSchemaSupported) &&
        sourceCaptureDefinition?.capture
    ) {
        return (
            <>
                <SourceCaptureChipOption
                    enabled={
                        sourceCaptureDefinition.targetSchema ===
                        'fromSourceName'
                    }
                    messageKey="workflows.sourceCapture.optionalSettings.targetSchema.chip"
                />

                <SourceCaptureChipOption
                    enabled={Boolean(sourceCaptureDefinition.deltaUpdates)}
                    messageKey="workflows.sourceCapture.optionalSettings.deltaUpdates.chip"
                />
            </>
        );
    }

    return null;
}

export default SourceCaptureChipOptionalSettings;
