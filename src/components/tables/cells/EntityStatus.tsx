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
    TaskShardDetails,
} from 'stores/ShardDetail';

interface Props {
    name: string;
}

function evaluateTaskStatus(statuses: TaskShardDetails[]): ShardStatusColor {
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
    const [taskShardDetails, setTaskShardDetails] = useState<
        TaskShardDetails[]
    >([]);
    const [compositeStatusColor, setCompositeStatusColor] =
        useState<ShardStatusColor>(defaultStatusColor);
    const [taskDisabled, setTaskDisabled] = useState<boolean>(false);

    const shardDetailStore = useRouteStore();

    const shards: Shard[] = shardDetailStore(shardDetailSelectors.shards);

    const getTaskShards = shardDetailStore(shardDetailSelectors.getTaskShards);
    const getTaskShardDetails = shardDetailStore(
        shardDetailSelectors.getTaskShardDetails
    );

    useEffect(() => {
        const taskShards: Shard[] = getTaskShards(name, shards);

        const shardDetails: TaskShardDetails[] =
            getTaskShardDetails(taskShards);

        const statusColor = evaluateTaskStatus(shardDetails);

        const disabled =
            shardDetails.filter((shard) => !shard.disabled).length === 0;

        setTaskShardDetails(shardDetails);
        setCompositeStatusColor(statusColor);
        setTaskDisabled(disabled);
    }, [
        getTaskShards,
        getTaskShardDetails,
        setTaskShardDetails,
        setTaskDisabled,
        name,
        shards,
    ]);

    return (
        <Tooltip
            title={taskShardDetails.map((shard, index) => (
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
                            border: shard.disabled
                                ? `solid 2px ${shard.color}`
                                : 0,
                            backgroundColor: shard.disabled ? '' : shard.color,
                            borderRadius: 50,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                        }}
                    />

                    <Typography
                        variant="caption"
                        sx={{ display: 'inline-block' }}
                    >
                        {shard.statusCode}
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
                    border: taskDisabled
                        ? `solid 2px ${compositeStatusColor}`
                        : 0,
                    backgroundColor: taskDisabled ? '' : compositeStatusColor,
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            />
        </Tooltip>
    );
}

export default EntityStatus;
