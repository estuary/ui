import type { BaseProps } from 'src/components/fieldSelection/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import useFieldSelectionAlgorithm from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { getFieldSelection } from 'src/utils/fieldSelection-utils';
import { hasLength } from 'src/utils/misc-utils';

const ExcludeAllButton = ({ bindingUUID, loading, selections }: BaseProps) => {
    const intl = useIntl();

    const { validateFieldSelection } = useFieldSelectionAlgorithm();

    const setMultiSelection = useBindingStore(
        (state) => state.setMultiSelection
    );

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={loading || formActive || !hasLength(selections)}
            onClick={() => {
                if (selections) {
                    validateFieldSelection({
                        exclude: selections.map(({ field }) => field),
                    }).then(
                        ({ builtBinding, fieldStanza, response }) => {
                            if (!response) {
                                return;
                            }

                            const updatedSelections = getFieldSelection(
                                response.outcomes,
                                fieldStanza,
                                builtBinding.collection.projections
                            );

                            setMultiSelection(
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
            style={{ textWrap: 'nowrap' }}
            variant="outlined"
        >
            {intl.formatMessage({ id: 'fieldSelection.table.cta.excludeAll' })}
        </Button>
    );
};

export default ExcludeAllButton;
