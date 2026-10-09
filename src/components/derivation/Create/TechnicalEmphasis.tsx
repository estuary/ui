import type { TechnicalEmphasisProps } from 'src/components/derivation/Create/types';

import { Typography } from '@mui/material';

function TechnicalEmphasis({
    enableBackground,
    children,
    sx,
    ...restProps
}: TechnicalEmphasisProps) {
    return (
        <Typography
            component="code"
            sx={{
                bgcolor: enableBackground
                    ? (theme) => theme.palette.background.code
                    : undefined,
                fontWeight: 500,
                fontFamily: 'Monospace',
                fontSize: 'inherit',
                ...sx,
            }}
            {...restProps}
        >
            {children}
        </Typography>
    );
}

export default TechnicalEmphasis;
