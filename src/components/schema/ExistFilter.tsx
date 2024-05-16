import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AutoCompleteOption, FieldFilter } from './types';

interface Props {
    setFieldFilter: (value: FieldFilter) => void;
}

const INPUT_ID = 'exist-filter';
const INPUT_LABEL_ID = 'exist-filter__label';

function ExistFilter({ setFieldFilter }: Props) {
    const intl = useIntl();

    const [localValue, setLocalValue] = useState<FieldFilter>('all');

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
        <FormControl fullWidth variant="outlined">
            <InputLabel id={INPUT_ID} variant="outlined">
                <FormattedMessage id="schemaEditor.table.filter.label" />
            </InputLabel>
            <Select
                labelId={INPUT_LABEL_ID}
                id={INPUT_ID}
                value={localValue}
                variant="outlined"
                onChange={(event) => {
                    setLocalValue(event.target.value as FieldFilter);
                    setFieldFilter(event.target.value as FieldFilter);
                }}
            >
                {fieldOptions.map((fieldOption) => (
                    <MenuItem
                        key={`exist-filter_options_${fieldOption.id}`}
                        value={fieldOption.id}
                    >
                        {fieldOption.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default ExistFilter;
