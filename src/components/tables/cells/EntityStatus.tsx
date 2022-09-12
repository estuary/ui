import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { ShardDetailStoreNames, useZustandStore } from 'context/Zustand';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    shardDetailSelectors,
    ShardDetailStore,
    ShardStatusColor,
    TaskShardDetails,
    useShardDetail_getTaskShardDetails,
    useShardDetail_getTaskShards,
    useShardDetail_shards,
} from 'stores/ShardDetail';

interface Props {
    name: string;
    shardDetailStoreName: ShardDetailStoreNames;
}

const indicatorSize = 16;

function EntityStatus({ name, shardDetailStoreName }: Props) {
    const theme = useTheme();

    const defaultStatusColor: ShardStatusColor =
        theme.palette.mode === 'dark' ? '#EEF8FF' : '#04192A';

    const [taskShardDetails, setTaskShardDetails] = useState<
        TaskShardDetails[]
    >([]);
    const [compositeStatusColor, setCompositeStatusColor] =
        useState<ShardStatusColor>(defaultStatusColor);
    const [taskDisabled, setTaskDisabled] = useState<boolean>(false);

    const shards = useShardDetail_shards();

    const getTaskShards = useShardDetail_getTaskShards();
    const getTaskShardDetails = useShardDetail_getTaskShardDetails();

    const getTaskStatusColor = useZustandStore<
        ShardDetailStore,
        ShardDetailStore['getTaskStatusColor']
    >(shardDetailStoreName, shardDetailSelectors.getTaskStatusColor);

    useEffect(() => {
        const taskShards: Shard[] = getTaskShards(name, shards);

        const shardDetails: TaskShardDetails[] = getTaskShardDetails(
            taskShards,
            defaultStatusColor
        );

        const statusColor: ShardStatusColor = getTaskStatusColor(
            shardDetails,
            defaultStatusColor
        );

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
        getTaskStatusColor,
        name,
        shards,
        defaultStatusColor,
    ]);

    return (
        <Tooltip
            title={taskShardDetails.map((shard, index) => (
                <Box
                    key={`${index}-shard-status-tooltip`}
                    sx={{ display: 'flex', alignItems: 'center' }}
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
                        <FormattedMessage id={shard.messageId} />
                    </Typography>
                </Box>
            ))}
            placement="bottom-start"
        >
            <span
                style={{
                    height: indicatorSize,
                    width: indicatorSize,
                    minWidth: indicatorSize,
                    maxWidth: indicatorSize,
                    minHeight: indicatorSize,
                    maxHeight: indicatorSize,

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
