import { TableCell, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TaskShardDetails } from 'stores/ShardDetail/types';

interface Props {
    shard: TaskShardDetails;
}

function StatusIndicatorAndLabel({ shard }: Props) {
    const { id, color, disabled, messageId } = shard;

    return (
        <TableCell width={250} key={`status-indicator-for-shard__${id}`}>
            <span
                style={{
                    height: 16,
                    width: 16,
                    marginRight: 12,
                    border: disabled ? `solid 2px ${color}` : 0,
                    backgroundColor: disabled ? '' : color,
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            />

            <Typography component="span" sx={{ verticalAlign: 'middle' }}>
                <FormattedMessage id={messageId} />
            </Typography>
        </TableCell>
    );
}

export default StatusIndicatorAndLabel;
