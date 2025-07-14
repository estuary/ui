import type { SaveButtonProps } from 'src/components/editor/Bindings/FieldSelection/FieldActions/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

export default function SaveButton({
    bindingUUID,
    close,
    fieldSelection,
    loading,
    projections,
    selectedAlgorithm,
}: SaveButtonProps) {
    const intl = useIntl();

    const setAlgorithmicSelection = useBindingStore(
        (state) => state.setAlgorithmicSelection
    );

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={
                loading ||
                formActive ||
                !hasLength(projections) ||
                !selectedAlgorithm
            }
            onClick={() => {
                if (projections && selectedAlgorithm) {
                    setAlgorithmicSelection(
                        selectedAlgorithm,
                        bindingUUID,
                        fieldSelection
                    );

                    close();
                }
            }}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
}
