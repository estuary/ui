import { Box, Tooltip, Typography } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { shardDetailSelectors, ShardStatusIndicator } from 'stores/ShardDetail';

interface Props {
    name: string;
}

function EntityStatus({ name }: Props) {
    const shardDetailStore = useRouteStore();
    const getShardStatusColor = shardDetailStore(
        shardDetailSelectors.getShardStatusColor
    );
    const getShardStatusIndicators = shardDetailStore(
        shardDetailSelectors.getShardStatusIndicators
    );

    const statusIndicators: ShardStatusIndicator[] =
        getShardStatusIndicators(name);

    return (
        <Tooltip
            title={statusIndicators.map(({ code, color }, index) => (
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
                            backgroundColor: color,
                            borderRadius: 50,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            marginRight: 4,
                        }}
                    />

                    <Typography
                        variant="caption"
                        sx={{ display: 'inline-block' }}
                    >
                        {code}
                    </Typography>
                </Box>
            ))}
            placement="bottom-start"
        >
            <span
                style={{
                    height: 16,
                    width: 16,
                    backgroundColor: getShardStatusColor(name),
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginRight: 12,
                }}
            />
        </Tooltip>
    );
}

export default EntityStatus;
