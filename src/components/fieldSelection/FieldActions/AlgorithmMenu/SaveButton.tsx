import type { SaveButtonProps } from 'src/components/fieldSelection/types';
import type { AlgorithmConfig } from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';

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
                const config: AlgorithmConfig =
                    selectedAlgorithm === 'depthZero'
                        ? { depth: 0 }
                        : selectedAlgorithm === 'depthTwo'
                          ? { depth: 2 }
                          : {
                                depth:
                                    typeof DEFAULT_RECOMMENDED_FLAG === 'number'
                                        ? DEFAULT_RECOMMENDED_FLAG
                                        : 1,
                            };

                setRecommendFields(
                    bindingUUID,
                    config?.depth ?? DEFAULT_RECOMMENDED_FLAG
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
