import { TableCell, Typography } from '@mui/material';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { shardDetailSelectors } from 'stores/ShardDetail';

interface Props {
    shard: Shard;
}

function StatusIndicatorAndLabel({ shard }: Props) {
    const { id } = shard.spec;

    const shardDetailStore = useRouteStore();

    const getShardStatusColor = shardDetailStore(
        shardDetailSelectors.getShardStatusColor
    );
    const getShardStatusMessageId = shardDetailStore(
        shardDetailSelectors.getShardStatusMessageId
    );
    const evaluateShardProcessingState = shardDetailStore(
        shardDetailSelectors.evaluateShardProcessingState
    );

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
                        ? `solid 2px ${getShardStatusColor(id)}`
                        : 0,
                    backgroundColor: taskDisabled
                        ? ''
                        : getShardStatusColor(id),
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
