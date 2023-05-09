import { AlertColor, Box, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';
import AlertBox from '../AlertBox';

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
                    <Typography variant="h5" component="span">
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
