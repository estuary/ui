import type { SaveButtonProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';

export default function SaveButton({
    close,
    handleClick,
    disabled,
    selectedAlgorithm,
}: SaveButtonProps) {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

    const fieldsRecommended = useSourceCaptureStore(
        (state) => state.fieldsRecommended
    );

    return (
        <Button
            disabled={disabled || formActive || !selectedAlgorithm}
            onClick={() => {
                const recommendedFlag =
                    selectedAlgorithm === 'depthZero'
                        ? 0
                        : selectedAlgorithm === 'depthOne'
                          ? 1
                          : selectedAlgorithm === 'depthTwo'
                            ? 2
                            : selectedAlgorithm === 'depthUnlimited'
                              ? true
                              : (fieldsRecommended ?? DEFAULT_RECOMMENDED_FLAG);

                logRocketEvent(CustomEvents.FIELD_SELECTION, {
                    fieldsRecommended,
                    recommendedFlag,
                    selectedAlgorithm,
                });

                handleClick(recommendedFlag);
                close();
            }}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
}
