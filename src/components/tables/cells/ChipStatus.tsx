import type { ChipStatusProps } from 'src/components/tables/cells/types';

import { TableCell } from '@mui/material';

import { useIntl } from 'react-intl';

import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function ChipStatus({ messageId, color }: ChipStatusProps) {
    const intl = useIntl();

    return (
        <TableCell>
            <OutlinedChip
                component="span"
                color={color}
                label={intl.formatMessage({ id: messageId })}
                size="small"
                variant="outlined"
            />
        </TableCell>
    );
}

export default ChipStatus;
