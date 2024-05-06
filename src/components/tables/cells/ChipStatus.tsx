import { Chip, ChipProps, TableCell } from '@mui/material';
import { useIntl } from 'react-intl';

interface Props {
    messageId: string;
    color: ChipProps['color'];
}

function ChipStatus({ messageId, color }: Props) {
    const intl = useIntl();

    return (
        <TableCell>
            <Chip
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
