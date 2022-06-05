import { TableCell, Typography } from '@mui/material';
import { ReplicaStatusCode } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useRouteStore } from 'hooks/useRouteStore';
import { shardDetailSelectors, ShardStatus } from 'stores/ShardDetail';

interface Props {
    shard: Shard;
}

const getShardStatus = ({ status }: Shard): ShardStatus => {
    if (status.length === 1) {
        return status[0].code ?? 'No shard status found.';
    } else if (status.length > 1) {
        const statusCodes: (ReplicaStatusCode | undefined)[] = status.map(
            ({ code }) => code
        );

        if (statusCodes.find((code) => code === 'PRIMARY')) {
            return 'PRIMARY';
        } else if (statusCodes.find((code) => code === 'FAILED')) {
            return 'FAILED';
        } else if (statusCodes.find((code) => code === 'IDLE')) {
            return 'IDLE';
        } else if (statusCodes.find((code) => code === 'STANDBY')) {
            return 'STANDBY';
        } else if (statusCodes.find((code) => code === 'BACKFILL')) {
            return 'BACKFILL';
        } else {
            return 'No shard status found.';
        }
    } else {
        return 'No shard status found.';
    }
};

function StatusIndicatorAndLabel({ shard }: Props) {
    const { id } = shard.spec;

    const shardDetailStore = useRouteStore();

    // TODO (shards) This is here to force a re-render
    const shards = shardDetailStore(shardDetailSelectors.shards);
    console.log('forcing re-render with shards', shards);

    const getShardStatusColor = shardDetailStore(
        shardDetailSelectors.getShardStatusColor
    );
    const evaluateShardProcessingState = shardDetailStore(
        shardDetailSelectors.evaluateShardProcessingState
    );

    const status = getShardStatus(shard);

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
                {status}
            </Typography>
        </TableCell>
    );
}

export default StatusIndicatorAndLabel;
