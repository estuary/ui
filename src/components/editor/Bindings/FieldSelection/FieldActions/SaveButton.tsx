import { Button } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    useBinding_recommendFields,
    useBinding_setMultiSelection,
} from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { hasLength } from 'utils/misc-utils';
import { evaluateUpdatedFields } from './shared';
import { SaveButtonProps } from './types';

export default function SaveButton({
    bindingUUID,
    loading,
    projections,
    selectedValue,
}: SaveButtonProps) {
    const intl = useIntl();

    const recommended = useBinding_recommendFields();
    const setMultiSelection = useBinding_setMultiSelection();

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={loading || formActive || !hasLength(projections)}
            onClick={() => {
                if (projections) {
                    const updatedFields = evaluateUpdatedFields(
                        projections,
                        recommended[bindingUUID],
                        selectedValue
                    );

                    setMultiSelection(bindingUUID, updatedFields);
                }
            }}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.evolve' })}
        </Button>
    );
}
