import type { SaveButtonProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';

export default function SaveButton({
    bindingUUID,
    close,
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
                    selectedAlgorithm === 'depthZero'
                        ? 0
                        : selectedAlgorithm === 'depthOne'
                          ? 1
                          : selectedAlgorithm === 'depthTwo'
                            ? 2
                            : selectedAlgorithm === 'depthUnlimited'
                              ? true
                              : DEFAULT_RECOMMENDED_FLAG;

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
