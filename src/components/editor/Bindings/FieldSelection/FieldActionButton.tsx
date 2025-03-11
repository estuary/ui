import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    useBinding_recommendFields,
    useBinding_setMultiSelection,
} from 'stores/Binding/hooks';
import { FieldSelectionDictionary } from 'stores/Binding/slices/FieldSelection';
import { isRequireOnlyField } from 'utils/workflow-utils';
import { CompositeProjection, FieldSelectionType } from './types';

interface Props {
    bindingUUID: string;
    disabled: boolean;
    labelId: string;
    projections: CompositeProjection[] | null | undefined;
    selectedValue: FieldSelectionType;
}

const evaluateUpdatedFields = (
    projections: CompositeProjection[],
    recommended: boolean,
    selectedValue: FieldSelectionType
) => {
    const updatedFields: FieldSelectionDictionary = {};

    projections.forEach(({ field, constraint, selectionMetadata }) => {
        const required = constraint
            ? isRequireOnlyField(constraint.type)
            : false;

        let selectionType = required ? 'require' : selectedValue;

        if (recommended) {
            selectionType =
                selectedValue === 'exclude' && required
                    ? 'default'
                    : selectedValue;
        }

        updatedFields[field] = { meta: selectionMetadata, mode: selectionType };
    });

    return updatedFields;
};

export default function FieldActionButton({
    bindingUUID,
    disabled,
    labelId,
    projections,
    selectedValue,
}: Props) {
    const recommended = useBinding_recommendFields();
    const setMultiSelection = useBinding_setMultiSelection();

    return (
        <Button
            disabled={disabled}
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
            <FormattedMessage id={labelId} />
        </Button>
    );
}
