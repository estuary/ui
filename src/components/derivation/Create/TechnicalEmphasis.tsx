import type { TechnicalEmphasisProps } from 'src/components/derivation/Create/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { codeBackground } from 'src/context/Theme';

function TechnicalEmphasis({
    enableBackground,
    intlKey,
}: TechnicalEmphasisProps) {
    const intl = useIntl();

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
            {intl.formatMessage({
                id: intlKey,
            })}
        </Typography>
    );
}

export default TechnicalEmphasis;
