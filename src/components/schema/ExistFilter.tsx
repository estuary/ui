import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useIntl } from 'react-intl';
import { AutoCompleteOption, FieldFilter } from './types';

interface Props {
    fieldFilter: FieldFilter;
    setFieldFilter: (value: FieldFilter) => void;
    disabled?: boolean;
}

function ExistFilter({ fieldFilter, setFieldFilter, disabled }: Props) {
    const intl = useIntl();

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
            label={intl.formatMessage({
                id: 'schemaEditor.table.filter.label',
            })}
            options={fieldOptions}
            defaultValue={fieldOptions.find(
                (datum) => datum.id === fieldFilter
            )}
            changeHandler={(_, value) => {
                setFieldFilter(value.id);
            }}
            autocompleteSx={{ flexGrow: 1 }}
            AutoCompleteOptions={{
                isOptionEqualToValue: (option, value) => option.id === value.id,
                disabled,
            }}
        />
    );
}

export default ExistFilter;
