import type { AlertColor} from '@mui/material';
import { Box, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import type { BaseComponentProps } from 'src/types';
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
                        <FormattedMessage id={title} />
                    </Typography>
                }
            >
                {children}
            </AlertBox>
        </Box>
    );
}

export default HeaderSummary;
