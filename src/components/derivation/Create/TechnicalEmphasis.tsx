import type { TechnicalEmphasisProps } from 'src/components/derivation/Create/types';

import { Typography } from '@mui/material';

import { codeBackground } from 'src/context/Theme';

function TechnicalEmphasis({
    enableBackground,
    children,
}: TechnicalEmphasisProps) {
    return (
        <Typography
            component="code"
            sx={{
                bgcolor: enableBackground
                    ? (theme) => codeBackground[theme.palette.mode]
                    : undefined,
                fontWeight: 500,
                fontFamily: 'Monospace',
            }}
        >
            {children}
        </Typography>
    );
}

export default TechnicalEmphasis;
