import { Box, Tooltip, Typography } from '@mui/material';
import { errorMain, successMain, warningMain } from 'context/Theme';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useState } from 'react';
import {
    defaultStatusColor,
    shardDetailSelectors,
    ShardStatus,
    ShardStatusColor,
    ShardStatusIndicator,
} from 'stores/ShardDetail';

interface Props {
    name: string;
}

function evaluateTaskStatus(
    statuses: ShardStatusIndicator[]
): ShardStatusColor {
    if (statuses.length === 1) {
        return statuses[0].color;
    } else if (statuses.length > 1) {
        const statusCodes: ShardStatus[] = statuses.map(
            ({ statusCode }) => statusCode
        );

        if (statusCodes.find((code) => code === 'PRIMARY')) {
            return successMain;
        } else if (statusCodes.find((code) => code === 'FAILED')) {
            return errorMain;
        } else if (
            statusCodes.find(
                (code) =>
                    code === 'IDLE' || code === 'STANDBY' || code === 'BACKFILL'
            )
        ) {
            return warningMain;
        } else {
            return defaultStatusColor;
        }
    } else {
        return defaultStatusColor;
    }
}

function EntityStatus({ name }: Props) {
    const [shardStatuses, setShardStatuses] = useState<ShardStatusIndicator[]>(
        []
    );
    const [taskStatusColor, setTaskStatusColor] =
        useState<ShardStatusColor>(defaultStatusColor);

    const shardDetailStore = useRouteStore();

    const shards: Shard[] = shardDetailStore(shardDetailSelectors.shards);

    const getTaskShards = shardDetailStore(shardDetailSelectors.getTaskShards);
    const getTaskStatusColor = shardDetailStore(
        shardDetailSelectors.getTaskStatusColor
    );
    const evaluateShardProcessingState = shardDetailStore(
        shardDetailSelectors.evaluateShardProcessingState
    );

    const taskDisabled: boolean = evaluateShardProcessingState(name);

    useEffect(() => {
        const taskShards: Shard[] = getTaskShards(name, shards);

        const shardStatusList: ShardStatusIndicator[] =
            getTaskStatusColor(taskShards);

        const compositeStatus = evaluateTaskStatus(shardStatusList);

        setShardStatuses(shardStatusList);
        setTaskStatusColor(compositeStatus);
    }, [getTaskShards, getTaskStatusColor, setShardStatuses, name, shards]);

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
                            border: taskDisabled
                                ? `solid 2px ${status.color}`
                                : 0,
                            backgroundColor: taskDisabled ? '' : status.color,
                            borderRadius: 50,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                        }}
                    />

                    <Typography
                        variant="caption"
                        sx={{ display: 'inline-block' }}
                    >
                        {status.statusCode}
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
                    border: taskDisabled ? `solid 2px ${taskStatusColor}` : 0,
                    backgroundColor: taskDisabled ? '' : taskStatusColor,
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            />
        </Tooltip>
    );
}

export default EntityStatus;
