import { TableCell } from '@mui/material';

import ChipList, { ChipListProps } from 'components/shared/ChipList';

function ChipListCell(props: ChipListProps) {
    return (
        <TableCell>
            <ChipList {...props} />
        </TableCell>
    );
}

export default ChipListCell;
