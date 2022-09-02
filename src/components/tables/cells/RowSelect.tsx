import { Checkbox, TableCell } from '@mui/material';
import { tableBorderSx } from 'context/Theme';

interface Props {
    isSelected: boolean;
    name: string;
}

function RowSelect({ isSelected, name }: Props) {
    return (
        <TableCell
            padding="checkbox"
            sx={{
                ...tableBorderSx,
                maxWidth: 42,
                minWidth: 42,
            }}
        >
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
