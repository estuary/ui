import { TableCell } from '@mui/material';
import ChipList from 'components/shared/ChipList';
import { ChipListProps } from 'components/shared/ChipList/types';

function ChipListCell(props: ChipListProps) {
    return (
        <TableCell>
            <ChipList {...props} />
        </TableCell>
    );
}

export default ChipListCell;
