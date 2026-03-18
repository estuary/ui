import type { MenuActionProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { mapAlgorithmToRecommendedValue } from 'src/utils/fieldSelection-utils';

export default function SaveButton({
    close,
    disabled,
    handleClick,
    selectionAlgorithm,
}: MenuActionProps) {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

    const fieldsRecommended = useSourceCaptureStore(
        (state) => state.fieldsRecommended
    );

    return (
        <Button
            disabled={disabled || formActive || !selectionAlgorithm}
            onClick={() => {
                const recommendedFlag = mapAlgorithmToRecommendedValue(
                    selectionAlgorithm,
                    fieldsRecommended
                );

                logRocketEvent(CustomEvents.FIELD_SELECTION, {
                    fieldsRecommended:
                        typeof fieldsRecommended === 'undefined'
                            ? 'undefined'
                            : fieldsRecommended,
                    recommendedFlag,
                    selectionAlgorithm,
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
