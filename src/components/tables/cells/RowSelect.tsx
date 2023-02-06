import { Checkbox, TableCell } from '@mui/material';
import CheckSquare from 'components/icons/CheckSquare';
import { Square } from 'iconoir-react';

interface Props {
    isSelected: boolean;
    name: string;
}

function RowSelect({ isSelected, name }: Props) {
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
                checked={isSelected}
                inputProps={{
                    'aria-labelledby': name,
                }}
                icon={<Square style={{ fontSize: 14 }} />}
                checkedIcon={<CheckSquare style={{ fontSize: 14 }} />}
            />
        </TableCell>
    );
}

export default RowSelect;
