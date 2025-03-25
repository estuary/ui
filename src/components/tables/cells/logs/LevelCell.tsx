import { Stack, TableCell } from '@mui/material';
import type { OpsLogFlowDocument } from 'types';
import ExpandRowButton from './ExpandRowButton';
import LevelIcon from './LevelIcon';
import { BaseCellSx } from './shared';

interface Props {
    row: OpsLogFlowDocument;
    expanded: boolean;
}

function LevelCell({ expanded, row }: Props) {
    return (
        <TableCell sx={BaseCellSx} component="div">
            <Stack direction="row" sx={{ alignItems: 'center' }}>
                <ExpandRowButton expanded={expanded} />
                <LevelIcon level={row.level} />
            </Stack>
        </TableCell>
    );
}

export default LevelCell;
