import type { ChangeEvent } from 'react';
import type { TableFilterProps } from 'src/components/tables/PrefixAlerts/types';

import { useRef } from 'react';

import { TextField } from '@mui/material';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';

import { TablePrefixes } from 'src/stores/Tables/hooks';

const TableFilter = ({
    disabled,
    searchQuery,
    setSearchQuery,
}: TableFilterProps) => {
    const filterTable = useRef(
        debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;

                setSearchQuery(filterQuery ?? '');
            },
            750
        )
    );

    useUnmount(() => {
        filterTable.current.cancel();
    });

    return (
        <TextField
            defaultValue={searchQuery}
            disabled={disabled}
            label="Filter by Prefix or Email"
            id={`entityTable-search__${TablePrefixes.fieldSelection}`}
            onChange={filterTable.current}
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
