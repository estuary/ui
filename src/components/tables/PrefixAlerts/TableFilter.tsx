import type { ChangeEvent } from 'react';
import type { TableFilterProps } from 'src/components/tables/PrefixAlerts/types';

import { TextField } from '@mui/material';

import { debounce } from 'lodash';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import { TablePrefixes } from 'src/stores/Tables/hooks';

const TableFilter = ({
    disabled,
    searchQuery,
    setSearchQuery,
}: TableFilterProps) => {
    const intl = useIntl();

    const filterTable = debounce(
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const filterQuery = event.target.value;

            setSearchQuery(filterQuery ?? '');
        },
        750
    );

    useUnmount(() => {
        filterTable.cancel();
    });

    return (
        <TextField
            defaultValue={searchQuery}
            disabled={disabled}
            label={intl.formatMessage({
                id: 'alerts.config.table.filterLabel',
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
};

export default TableFilter;
