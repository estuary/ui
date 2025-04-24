import type { ChipListProps } from 'src/components/shared/ChipList/types';

import { TableCell } from '@mui/material';

import ChipList from 'src/components/shared/ChipList';

function ChipListCell(props: ChipListProps) {
    return (
        <TableCell>
            <ChipList {...props} />
        </TableCell>
    );
}

export default ChipListCell;
