import { Checkbox, TableCell } from '@mui/material';

interface Props {
    isSelected: boolean;
    name: string;
}

function RowSelect({ isSelected, name }: Props) {
    return (
        <TableCell padding="checkbox">
            <Checkbox
                color="primary"
                checked={isSelected}
                inputProps={{
                    'aria-labelledby': name,
                }}
            />
        </TableCell>
    );
}

export default RowSelect;
