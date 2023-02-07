import { TableCell, Typography, useTheme } from '@mui/material';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { FormattedMessage } from 'react-intl';
import {
    useShardDetail_evaluateShardProcessingState,
    useShardDetail_getShardStatusColor,
    useShardDetail_getShardStatusMessageId,
} from 'stores/ShardDetail/hooks';
import { ShardStatusColor } from 'stores/ShardDetail/types';

interface Props {
    shard: Shard;
}

function StatusIndicatorAndLabel({ shard }: Props) {
    const { id } = shard.spec;
    const shardId = id ?? '';

    const theme = useTheme();

    const getShardStatusColor = useShardDetail_getShardStatusColor();
    const getShardStatusMessageId = useShardDetail_getShardStatusMessageId();

    const evaluateShardProcessingState =
        useShardDetail_evaluateShardProcessingState();

    const defaultStatusColor: ShardStatusColor =
        theme.palette.mode === 'dark' ? '#E1E9F4' : '#C4D3E9';

    const statusMessageId = getShardStatusMessageId(shardId);

    const taskDisabled: boolean = evaluateShardProcessingState(shardId);

    return (
        <TableCell width={250}>
            <span
                style={{
                    height: 16,
                    width: 16,
                    marginRight: 12,
                    border: taskDisabled
                        ? `solid 2px ${getShardStatusColor(
                              shardId,
                              defaultStatusColor
                          )}`
                        : 0,
                    backgroundColor: taskDisabled
                        ? ''
                        : getShardStatusColor(shardId, defaultStatusColor),
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            />

            <Typography component="span" sx={{ verticalAlign: 'middle' }}>
                <FormattedMessage id={statusMessageId} />
            </Typography>
        </TableCell>
    );
}

export default StatusIndicatorAndLabel;
