import { Checkbox, TableCell } from '@mui/material';

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
                checked={disabled ?? isSelected}
                disabled={disabled}
                inputProps={{
                    'aria-labelledby': name,
                }}
            />
        </TableCell>
    );
}

export default RowSelect;
