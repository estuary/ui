import { Box, Tooltip, Typography } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { CSSProperties } from 'react';
import {
    shardDetailSelectors,
    ShardStatusIndicatorText,
} from 'stores/ShardDetail';

interface Props {
    name: string;
}

function EntityStatus({ name }: Props) {
    const shardDetailStore = useRouteStore();
    const getShardStatusColor = shardDetailStore(
        shardDetailSelectors.getShardStatusColor
    );
    const getShardStatusIndicatorText = shardDetailStore(
        shardDetailSelectors.getShardStatusIndicatorText
    );
    const evaluateShardProcessingState = shardDetailStore(
        shardDetailSelectors.evaluateShardProcessingState
    );

    const statusIndicators: ShardStatusIndicatorText[] =
        getShardStatusIndicatorText(name);

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
            title={statusIndicators.map((text, index) => (
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
                        {text}
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
