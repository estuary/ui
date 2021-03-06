import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    shardDetailSelectors,
    ShardStatusColor,
    TaskShardDetails,
} from 'stores/ShardDetail';

interface Props {
    name: string;
}

function EntityStatus({ name }: Props) {
    const theme = useTheme();

    const defaultStatusColor: ShardStatusColor =
        theme.palette.mode === 'dark' ? '#EEF8FF' : '#04192A';

    const [taskShardDetails, setTaskShardDetails] = useState<
        TaskShardDetails[]
    >([]);
    const [compositeStatusColor, setCompositeStatusColor] =
        useState<ShardStatusColor>(defaultStatusColor);
    const [taskDisabled, setTaskDisabled] = useState<boolean>(false);

    const useShardDetailStore = useRouteStore();

    const shards: Shard[] = useShardDetailStore(shardDetailSelectors.shards);

    const getTaskShards = useShardDetailStore(
        shardDetailSelectors.getTaskShards
    );
    const getTaskShardDetails = useShardDetailStore(
        shardDetailSelectors.getTaskShardDetails
    );
    const getTaskStatusColor = useShardDetailStore(
        shardDetailSelectors.getTaskStatusColor
    );

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
