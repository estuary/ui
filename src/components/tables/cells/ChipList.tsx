import { TableCell } from '@mui/material';
import ChipList from 'src/components/shared/ChipList';
import { ChipListProps } from 'src/components/shared/ChipList/types';

function ChipListCell(props: ChipListProps) {
    return (
        <TableCell>
            <ChipList {...props} />
        </TableCell>
    );
}

export default ChipListCell;
