import type { AlertColor } from '@mui/material';
import type { BaseComponentProps } from 'src/types';

import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';

interface Props extends BaseComponentProps {
    severity: AlertColor;
    title: string;
}

function HeaderSummary({ severity, title, children }: Props) {
    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <AlertBox
                short
                severity={severity}
                title={
                    <Typography
                        component="span"
                        sx={{ fontSize: 18, fontWeight: 500 }}
                    >
                        {title}
                    </Typography>
                }
            >
                {children}
            </AlertBox>
        </Box>
    );
}

/** @deprecated Prefer the named `HeaderSummary` export */
function HeaderSummaryWrapper({ title, ...props }: Props) {
    const intl = useIntl();

    return (
        <HeaderSummary {...props} title={intl.formatMessage({ id: title })} />
    );
}

export default HeaderSummaryWrapper;
