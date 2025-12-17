import { Box, useTheme } from '@mui/material';

import { Check, Copy } from 'iconoir-react';

interface CopyIconIndicatorProps {
    isCopied: boolean;
    isHovered: boolean;
}

function CopyIconIndicator({ isCopied, isHovered }: CopyIconIndicatorProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'relative',
                width: 12,
                height: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Check
                style={{
                    position: 'absolute',
                    fontSize: 12,
                    color: theme.palette.success.main,
                    opacity: isCopied ? 1 : 0,
                    transition: 'opacity 0.1s ease-out',
                }}
            />
            <Copy
                style={{
                    position: 'absolute',
                    fontSize: 12,
                    color: theme.palette.text.disabled,
                    opacity: !isCopied && isHovered ? 1 : 0,
                    transition: 'opacity 0.1s ease-in',
                }}
            />
        </Box>
    );
}

export default CopyIconIndicator;
