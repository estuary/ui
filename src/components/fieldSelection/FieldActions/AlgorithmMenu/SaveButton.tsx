import type { SaveButtonProps } from 'src/components/fieldSelection/types';
import type { AlgorithmConfig } from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import useFieldSelectionAlgorithm from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import {
    DEFAULT_RECOMMENDED_FLAG,
    getFieldSelection,
} from 'src/utils/fieldSelection-utils';
import { hasLength } from 'src/utils/misc-utils';

export default function SaveButton({
    bindingUUID,
    close,
    loading,
    selections,
    selectedAlgorithm,
}: SaveButtonProps) {
    const intl = useIntl();

    const { validateFieldSelection } = useFieldSelectionAlgorithm();

    const setAlgorithmicSelection = useBindingStore(
        (state) => state.setAlgorithmicSelection
    );

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={
                loading ||
                formActive ||
                !hasLength(selections) ||
                !selectedAlgorithm
            }
            onClick={() => {
                const config: AlgorithmConfig | undefined =
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

                if (selections && selectedAlgorithm) {
                    validateFieldSelection(config).then(
                        ({ builtBinding, fieldStanza, response }) => {
                            if (!response) {
                                return;
                            }

                            const updatedSelections = getFieldSelection(
                                response.outcomes,
                                fieldStanza,
                                builtBinding.collection.projections
                            );

                            setAlgorithmicSelection(
                                selectedAlgorithm,
                                bindingUUID,
                                updatedSelections,
                                response.hasConflicts
                            );

                            close();
                        },
                        (_errors: string | string[]) => {
                            // if (typeof errors === 'string') {
                            //     setServerError([{ ...BASE_ERROR, message: errors }]);
                            //     return;
                            // }
                            // const formattedErrors: PostgrestError[] = errors.map(
                            //     (error) => ({ ...BASE_ERROR, message: error })
                            // );
                            // setServerError(formattedErrors);
                        }
                    );
                }
            }}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
}
