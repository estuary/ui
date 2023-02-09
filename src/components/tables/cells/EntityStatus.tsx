import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useShardDetail_error,
    useShardDetail_getTaskShardDetails,
    useShardDetail_getTaskShards,
    useShardDetail_getTaskStatusColor,
    useShardDetail_shards,
} from 'stores/ShardDetail/hooks';
import {
    ShardStatusColor,
    TaskShardDetailsWithShard,
} from 'stores/ShardDetail/types';

interface Props {
    name: string;
}

const indicatorSize = 16;

function EntityStatus({ name }: Props) {
    const theme = useTheme();

    const defaultStatusColor: ShardStatusColor =
        theme.palette.mode === 'dark' ? '#E1E9F4' : '#C4D3E9';

    const [taskShardDetails, setTaskShardDetails] = useState<
        TaskShardDetailsWithShard[]
    >([]);
    const [compositeStatusColor, setCompositeStatusColor] =
        useState<ShardStatusColor>(defaultStatusColor);
    const [taskDisabled, setTaskDisabled] = useState<boolean>(false);

    const shards = useShardDetail_shards();
    const shardError = useShardDetail_error();

    const getTaskShards = useShardDetail_getTaskShards();
    const getTaskShardDetails = useShardDetail_getTaskShardDetails();
    const getTaskStatusColor = useShardDetail_getTaskStatusColor();

    // TODO (shards) the details and color should be put into the store
    //  similar to stats so we can control this stuff from within the store
    useEffect(() => {
        const taskShards: Shard[] = getTaskShards(name, shards);

        const shardDetails: TaskShardDetailsWithShard[] = getTaskShardDetails(
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
        shardError, // Need to rerun this if there is an error
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
