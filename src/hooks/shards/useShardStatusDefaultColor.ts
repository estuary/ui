import { useMemo } from 'react';

import { useTheme } from '@mui/material';

import { shardStatusDefaultColor } from 'src/context/Theme';
import { ShardStatusColor } from 'src/stores/ShardDetail/types';

function useShardStatusDefaultColor() {
    const theme = useTheme();

    return useMemo<ShardStatusColor>(
        () => shardStatusDefaultColor[theme.palette.mode] as ShardStatusColor,
        [theme.palette.mode]
    );
}

export default useShardStatusDefaultColor;
