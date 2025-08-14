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
                        : selectedAlgorithm === 'depthTwo'
                          ? 2
                          : DEFAULT_RECOMMENDED_FLAG;

                setRecommendFields(
                    bindingUUID,
                    recommendedFlag ?? DEFAULT_RECOMMENDED_FLAG
                );

                advanceHydrationStatus('HYDRATED');
                close();
            }}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
}
