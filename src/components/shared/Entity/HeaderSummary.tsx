import { Alert, AlertProps, AlertTitle, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    severity: AlertProps['severity'];
    title: string;
}

function HeaderSummary({ severity, title, children }: Props) {
    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Alert
                icon={false}
                sx={{
                    'width': '100%',
                    '& .MuiAlert-message': { width: '100%' },
                }}
                severity={severity}
                variant="standard"
            >
                <AlertTitle>
                    <FormattedMessage id={title} />
                </AlertTitle>
                {children}
            </Alert>
        </Box>
    );
}

export default HeaderSummary;
