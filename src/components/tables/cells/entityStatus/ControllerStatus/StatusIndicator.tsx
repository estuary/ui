import { Box, useTheme } from '@mui/material';
import { getStatusIndicatorColor } from 'utils/entityStatus-utils';
import type { StatusIndicatorProps } from './types';

const INDICATOR_SIZE = 16;

export default function StatusIndicator({
    smallMargin,
    status,
}: StatusIndicatorProps) {
    const theme = useTheme();

    const color = getStatusIndicatorColor(theme.palette.mode, status);

    const INDICATOR_MARGIN = smallMargin ? 4 : 12;

    return (
        <Box>
            <span
                style={{
                    height: INDICATOR_SIZE,
                    width: INDICATOR_SIZE,
                    marginRight: INDICATOR_MARGIN,
                    border: 0,
                    backgroundColor: color.hex,
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            />
        </Box>
    );
}
