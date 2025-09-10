import type { SaveButtonProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';

export default function SaveButton({
    bindingUUID,
    close,
    fieldsRecommended,
    loading,
    selectedAlgorithm,
}: SaveButtonProps) {
    const intl = useIntl();

    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const setRecommendFields = useBindingStore(
        (state) => state.setRecommendFields
    );

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={loading || formActive || !selectedAlgorithm}
            onClick={() => {
                const recommendedFlag =
                    selectedAlgorithm === 'depthDefault'
                        ? (fieldsRecommended ?? DEFAULT_RECOMMENDED_FLAG)
                        : selectedAlgorithm === 'depthZero'
                          ? 0
                          : selectedAlgorithm === 'depthOne'
                            ? 1
                            : selectedAlgorithm === 'depthTwo'
                              ? 2
                              : selectedAlgorithm === 'depthUnlimited'
                                ? true
                                : DEFAULT_RECOMMENDED_FLAG;

                logRocketEvent(CustomEvents.FIELD_SELECTION, {
                    fieldsRecommended,
                    recommendedFlag,
                    selectedAlgorithm,
                });
                setRecommendFields(bindingUUID, recommendedFlag);

                advanceHydrationStatus('HYDRATED', bindingUUID);
                close();
            }}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
}
