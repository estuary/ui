import { Checkbox, TableCell } from '@mui/material';

import { isBoolean } from 'lodash';

interface Props {
    isSelected: boolean;
    name: string;
    disabled?: boolean;
}

function RowSelect({ disabled, isSelected, name }: Props) {
    return (
        <TableCell
            padding="checkbox"
            sx={{
                maxWidth: 42,
                minWidth: 42,
            }}
        >
            <Checkbox
                color="primary"
                checked={
                    isBoolean(disabled) ? disabled || isSelected : isSelected
                }
                disabled={disabled}
                inputProps={{
                    'aria-label': name,
                    'id': `row-select__${name}`,
                }}
            />
        </TableCell>
    );
}

export default RowSelect;
