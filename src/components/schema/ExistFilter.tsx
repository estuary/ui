import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { AutoCompleteOption, FieldFilter } from './types';

interface Props {
    fieldFilter: FieldFilter;
    setFieldFilter: (value: FieldFilter) => void;
    disabled?: boolean;
}

function ExistFilter({ fieldFilter, setFieldFilter, disabled }: Props) {
    const intl = useIntl();

    const [localValue, setLocalValue] = useState(fieldFilter);

    const fieldOptions: AutoCompleteOption[] = [
        {
            id: 'all',
            label: intl.formatMessage({
                id: 'schemaEditor.table.filter.option.all',
            }),
        },
        {
            id: 'must',
            label: intl.formatMessage({
                id: 'schemaEditor.table.filter.option.must',
            }),
        },
        {
            id: 'may',
            label: intl.formatMessage({
                id: 'schemaEditor.table.filter.option.may',
            }),
        },
    ];

    return (
        <AutocompletedField
            autocompleteSx={{ flexGrow: 1 }}
            changeHandler={(_, value) => {
                setFieldFilter(value.id);
                setLocalValue(value.id);
            }}
            defaultValue={fieldOptions.find(
                (datum) => datum.id === fieldFilter
            )}
            label={intl.formatMessage({
                id: 'schemaEditor.table.filter.label',
            })}
            options={fieldOptions}
            AutoCompleteOptions={{
                isOptionEqualToValue: (option, value) =>
                    option.id === (value.id ?? value),
                disabled,
                value: localValue,
            }}
        />
    );
}

export default ExistFilter;
