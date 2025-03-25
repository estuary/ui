import type { ShardStatusColor } from 'stores/ShardDetail/types';
import { useTheme } from '@mui/material';
import { shardStatusDefaultColor } from 'context/Theme';
import { useMemo } from 'react';

function useShardStatusDefaultColor() {
    const theme = useTheme();

    return useMemo<ShardStatusColor>(
        () => shardStatusDefaultColor[theme.palette.mode] as ShardStatusColor,
        [theme.palette.mode]
    );
}

export default useShardStatusDefaultColor;
