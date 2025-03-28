import { Button } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    useBinding_recommendFields,
    useBinding_setMultiSelection,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';
import { evaluateUpdatedFields } from './shared';
import { SaveButtonProps } from './types';

export default function SaveButton({
    bindingUUID,
    closeMenu,
    loading,
    projections,
    selectedAlgorithm,
}: SaveButtonProps) {
    const intl = useIntl();

    const recommended = useBinding_recommendFields();
    const setMultiSelection = useBinding_setMultiSelection();

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
                    const selectedValue =
                        selectedAlgorithm === 'excludeAll'
                            ? 'exclude'
                            : 'default';

                    const updatedFields = evaluateUpdatedFields(
                        projections,
                        recommended[bindingUUID],
                        selectedValue
                    );

                    setMultiSelection(bindingUUID, updatedFields);
                    closeMenu();
                }
            }}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
}
