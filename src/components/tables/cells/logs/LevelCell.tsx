import { Stack, TableCell } from '@mui/material';
import { OpsLogFlowDocument } from 'types';
import ExpandRowButton from './ExpandRowButton';
import LevelIcon from './LevelIcon';
import { BaseCellSx } from './shared';

interface Props {
    row: OpsLogFlowDocument;
    expanded: boolean;
    disableExpand?: boolean;
}

function LevelCell({ disableExpand, expanded, row }: Props) {
    return (
        <TableCell sx={BaseCellSx} component="div">
            <Stack direction="row" sx={{ alignItems: 'center' }}>
                <ExpandRowButton disable={disableExpand} expanded={expanded} />
                <LevelIcon level={row.level} />
            </Stack>
        </TableCell>
    );
}

export default LevelCell;
