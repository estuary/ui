import type {
    AutoCompleteOptionForExistFilter,
    FieldFilter,
} from 'src/components/schema/types';

import { useState } from 'react';

import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';

interface Props {
    fieldFilter: FieldFilter;
    setFieldFilter: (value: FieldFilter) => void;
    disabled?: boolean;
}

function ExistFilter({ fieldFilter, setFieldFilter, disabled }: Props) {
    const fieldOptions: AutoCompleteOptionForExistFilter[] = [
        {
            id: 'ALL',
            label: 'All',
        },
        {
            id: 'MUST',
            label: 'Must exist',
        },
        {
            id: 'MAY',
            label: 'May exist',
        },
    ];

    const findOption = (filterVal: FieldFilter) => {
        return fieldOptions.find((datum) => datum.id === filterVal);
    };

    const [localValue, setLocalValue] = useState(findOption(fieldFilter));

    return (
        <AutocompletedField
            autocompleteSx={{ flexGrow: 1 }}
            changeHandler={(_, value) => {
                setFieldFilter(value.id);
                setLocalValue(value);
            }}
            defaultValue={localValue}
            label="Filter fields"
            options={fieldOptions}
            AutoCompleteOptions={{
                isOptionEqualToValue: (option, value) => option.id === value.id,
                disabled,
                value: localValue,
            }}
        />
    );
}

export default ExistFilter;
