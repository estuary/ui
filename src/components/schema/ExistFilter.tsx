import type {
    AutoCompleteOptionForExistFilter,
    FieldFilter,
} from 'src/components/schema/types';

import { useState } from 'react';

import { useIntl } from 'react-intl';

import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';

interface Props {
    fieldFilter: FieldFilter;
    setFieldFilter: (value: FieldFilter) => void;
    disabled?: boolean;
}

function ExistFilter({ fieldFilter, setFieldFilter, disabled }: Props) {
    const intl = useIntl();

    const fieldOptions: AutoCompleteOptionForExistFilter[] = [
        {
            id: 'ALL',
            label: intl.formatMessage({
                id: 'schemaEditor.table.filter.option.all',
            }),
        },
        {
            id: 'MUST',
            label: intl.formatMessage({
                id: 'schemaEditor.table.filter.option.must',
            }),
        },
        {
            id: 'MAY',
            label: intl.formatMessage({
                id: 'schemaEditor.table.filter.option.may',
            }),
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
            label={intl.formatMessage({
                id: 'schemaEditor.table.filter.label',
            })}
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
