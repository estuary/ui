import { useTheme } from '@mui/material';
import { useMemo } from 'react';

import { ShardStatusColor } from 'stores/ShardDetail/types';

function useShardStatusDefaultColor() {
    const theme = useTheme();

    return useMemo<ShardStatusColor>(
        () => (theme.palette.mode === 'dark' ? '#E1E9F4' : '#C4D3E9'),
        [theme.palette.mode]
    );
}

export default useShardStatusDefaultColor;
