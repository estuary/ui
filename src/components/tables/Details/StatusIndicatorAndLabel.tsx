import { TableCell, Typography, useTheme } from '@mui/material';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { shardDetailSelectors, ShardStatusColor } from 'stores/ShardDetail';

interface Props {
    shard: Shard;
}

function StatusIndicatorAndLabel({ shard }: Props) {
    const { id } = shard.spec;

    const useShardDetailStore = useRouteStore();
    const theme = useTheme();

    const getShardStatusColor = useShardDetailStore(
        shardDetailSelectors.getShardStatusColor
    );
    const getShardStatusMessageId = useShardDetailStore(
        shardDetailSelectors.getShardStatusMessageId
    );
    const evaluateShardProcessingState = useShardDetailStore(
        shardDetailSelectors.evaluateShardProcessingState
    );

    const defaultStatusColor: ShardStatusColor =
        theme.palette.mode === 'dark' ? '#EEF8FF' : '#04192A';

    const statusMessageId = getShardStatusMessageId(id);

    const taskDisabled: boolean = evaluateShardProcessingState(id);

    return (
        <TableCell width={250}>
            <span
                style={{
                    height: 16,
                    width: 16,
                    marginRight: 12,
                    border: taskDisabled
                        ? `solid 2px ${getShardStatusColor(
                              id,
                              defaultStatusColor
                          )}`
                        : 0,
                    backgroundColor: taskDisabled
                        ? ''
                        : getShardStatusColor(id, defaultStatusColor),
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
