import { TableCell, Typography, useTheme } from '@mui/material';
import { ShardDetailStoreNames, useZustandStore } from 'context/Zustand';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { FormattedMessage } from 'react-intl';
import {
    shardDetailSelectors,
    ShardDetailStore,
    ShardStatusColor,
    useShardDetail_getShardStatusColor,
} from 'stores/ShardDetail';

interface Props {
    shard: Shard;
    shardDetailStoreName: ShardDetailStoreNames;
}

function StatusIndicatorAndLabel({ shard, shardDetailStoreName }: Props) {
    const { id } = shard.spec;
    const shardId = id ?? '';

    const theme = useTheme();

    const getShardStatusColor = useShardDetail_getShardStatusColor();

    const getShardStatusMessageId = useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getShardStatusMessageId']
    >(shardDetailStoreName, shardDetailSelectors.getShardStatusMessageId);

    const evaluateShardProcessingState = useZustandStore<
        ShardDetailStore,
        ShardDetailStore['evaluateShardProcessingState']
    >(shardDetailStoreName, shardDetailSelectors.evaluateShardProcessingState);

    const defaultStatusColor: ShardStatusColor =
        theme.palette.mode === 'dark' ? '#EEF8FF' : '#04192A';

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
