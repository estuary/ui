import { Stack, TableCell } from '@mui/material';
import ExpandRowButton from './ExpandRowButton';
import LevelIcon from './LevelIcon';
import { BaseCellSx } from './shared';

interface Props {
    row: any;
    expanded: boolean;
    disableExpand?: boolean;
}

function LevelCell({ disableExpand, expanded, row }: Props) {
    return (
        <TableCell sx={BaseCellSx}>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
                <ExpandRowButton disable={disableExpand} expanded={expanded} />
                <LevelIcon level={row.level} />
            </Stack>
        </TableCell>
    );
}

export default LevelCell;
