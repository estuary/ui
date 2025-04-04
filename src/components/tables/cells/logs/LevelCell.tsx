import type { OpsLogFlowDocument } from 'src/types';

import { Stack, TableCell } from '@mui/material';

import ExpandRowButton from 'src/components/tables/cells/logs/ExpandRowButton';
import LevelIcon from 'src/components/tables/cells/logs/LevelIcon';
import { BaseCellSx } from 'src/components/tables/cells/logs/shared';

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
