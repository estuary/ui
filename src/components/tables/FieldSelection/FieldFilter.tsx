import { TextField } from '@mui/material';
import { debounce } from 'lodash';
import { ChangeEvent } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_searchQuery,
    useBinding_setSearchQuery,
} from 'stores/Binding/hooks';
import { TablePrefixes } from 'stores/Tables/hooks';

interface Props {
    disabled: boolean;
}

export default function FieldFilter({ disabled }: Props) {
    const intl = useIntl();

    const searchQuery = useBinding_searchQuery();
    const setSearchQuery = useBinding_setSearchQuery();

    const filterTable = debounce(
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const filterQuery = event.target.value;
            const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

            setSearchQuery(hasQuery ? filterQuery : null);
        },
        750
    );

    return (
        <TextField
            defaultValue={searchQuery}
            disabled={disabled}
            label={intl.formatMessage({
                id: 'fieldSelection.table.label.filter',
            })}
            id={`entityTable-search__${TablePrefixes.fieldSelection}`}
            onChange={filterTable}
            size="small"
            sx={{
                'width': 300,
                '& .MuiInputBase-root': {
                    borderRadius: 3,
                },
            }}
            variant="outlined"
        />
    );
}
