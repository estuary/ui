import type { ChipStatusProps } from 'src/components/tables/cells/types';

import { TableCell } from '@mui/material';

import { useIntl } from 'react-intl';

import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

export function ChipStatus({
    message,
    color,
    TableCellProps = {},
}: Omit<ChipStatusProps, 'messageId'> & { message: string }) {
    return (
        <TableCell {...TableCellProps}>
            <OutlinedChip
                component="span"
                color={color}
                label={message}
                size="small"
                variant="outlined"
            />
        </TableCell>
    );
}

/** @deprecated Prefer the named `ChipStatus` export */
function ChipStatusWrapper({ messageId, ...props }: ChipStatusProps) {
    const intl = useIntl();

    return (
        <ChipStatus
            {...props}
            message={intl.formatMessage({ id: messageId })}
        />
    );
}

export default ChipStatusWrapper;
