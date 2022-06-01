import { Box, Tooltip, Typography } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { CSSProperties } from 'react';
import { shardDetailSelectors, ShardStatus } from 'stores/ShardDetail';

interface Props {
    name: string;
}

function EntityStatus({ name }: Props) {
    const shardDetailStore = useRouteStore();

    // TODO (shards) This is here to force a re-render
    const shards = shardDetailStore(shardDetailSelectors.shards);
    console.log('forcing re-render with shards', shards);

    const getShardStatusColor = shardDetailStore(
        shardDetailSelectors.getShardStatusColor
    );
    const getShardStatus = shardDetailStore(
        shardDetailSelectors.getShardStatus
    );
    const evaluateShardProcessingState = shardDetailStore(
        shardDetailSelectors.evaluateShardProcessingState
    );

    const shardStatuses: ShardStatus[] = getShardStatus(name);

    const taskDisabled: boolean = evaluateShardProcessingState(name);

    const statusIndicatorStyle: CSSProperties = {
        border: taskDisabled ? `solid 2px ${getShardStatusColor(name)}` : 0,
        backgroundColor: taskDisabled ? '' : getShardStatusColor(name),
        borderRadius: 50,
        display: 'inline-block',
        verticalAlign: 'middle',
    };

    return (
        <Tooltip
            title={shardStatuses.map((status, index) => (
                <Box
                    key={`${index}-shard-status-tooltip`}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <span
                        style={{
                            height: 12,
                            width: 12,
                            marginRight: 4,
                            ...statusIndicatorStyle,
                        }}
                    />

                    <Typography
                        variant="caption"
                        sx={{ display: 'inline-block' }}
                    >
                        {status}
                    </Typography>
                </Box>
            ))}
            placement="bottom-start"
        >
            <span
                style={{
                    height: 16,
                    width: 16,
                    marginRight: 12,
                    ...statusIndicatorStyle,
                }}
            />
        </Tooltip>
    );
}

export default EntityStatus;
