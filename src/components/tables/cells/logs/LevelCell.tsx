import { Stack, TableCell } from '@mui/material';
import ExpandRowButton from './ExpandRowButton';
import LevelIcon from './LevelIcon';
import { BaseCellSx } from './shared';

interface Props {
    row: any;
    expanded: boolean;
}

function LevelCell({ expanded, row }: Props) {
    return (
        <TableCell sx={BaseCellSx}>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
                <ExpandRowButton expanded={expanded} />
                <LevelIcon level={row.level} />
            </Stack>
        </TableCell>
    );
}

export default LevelCell;
