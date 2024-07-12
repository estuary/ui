import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    useBinding_recommendFields,
    useBinding_searchQuery,
    useBinding_setMultiSelection,
} from 'stores/Binding/hooks';
import { FieldSelection } from 'stores/Binding/slices/FieldSelection';
import { evaluateRequiredIncludedFields } from 'utils/workflow-utils';
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
    const updatedFields: FieldSelection = {};

    projections.forEach(({ field, constraint }) => {
        const includeRequired = constraint
            ? evaluateRequiredIncludedFields(constraint.type)
            : false;

        let selectionType = includeRequired ? 'include' : selectedValue;

        if (recommended) {
            selectionType =
                selectedValue === 'exclude' && includeRequired
                    ? 'default'
                    : selectedValue;
        }

        updatedFields[field] = selectionType;
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
    const searchQuery = useBinding_searchQuery();

    return (
        <Button
            disabled={disabled}
            onClick={() => {
                const filteredProjections = searchQuery
                    ? projections?.filter(
                          ({ field, ptr }) =>
                              field.includes(searchQuery) ||
                              ptr?.includes(searchQuery)
                      )
                    : projections;

                if (filteredProjections) {
                    const updatedFields = evaluateUpdatedFields(
                        filteredProjections,
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
