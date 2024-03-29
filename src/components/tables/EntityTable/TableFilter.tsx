import { TextField, useMediaQuery, useTheme } from '@mui/material';
import { DebouncedFunc } from 'lodash';
import { RefObject } from 'react';

interface Props {
    label: string;
    searchQuery: any;
    searchTextField: RefObject<HTMLInputElement>;
    onFilterChange: DebouncedFunc<(value: string) => void>;
}

function EntityTableFilter({
    label,
    searchQuery,
    searchTextField,
    onFilterChange,
}: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <TextField
            inputRef={searchTextField}
            label={label}
            variant="outlined"
            size="small"
            defaultValue={searchQuery}
            onChange={(event) => {
                onFilterChange(event.target.value);
            }}
            sx={{
                'width': belowMd ? 'auto' : 350,
                '& .MuiInputBase-root': { borderRadius: 3 },
            }}
        />
    );
}

export default EntityTableFilter;
