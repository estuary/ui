import {
    Alert,
    AlertTitle,
    Box,
    List,
    ListItem,
    Typography,
} from '@mui/material';
import Logs from 'components/Logs';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { FormattedMessage } from 'react-intl';

type NewCaptureErrorProps = {
    title: string;
    errors?: string[];
    logToken?: string | null;
};

function NewCaptureError(props: NewCaptureErrorProps) {
    const { logToken, errors, title } = props;

    return (
        <Box sx={{ width: '100%' }}>
            <Alert
                sx={{
                    'width': '100%',
                    '& .MuiAlert-message': { width: '100%' },
                }}
                severity="error"
            >
                <AlertTitle>
                    <FormattedMessage id={title} />
                </AlertTitle>
                {errors && errors.length > 0 && (
                    <List dense>
                        {errors.map((error: any, index: number) => {
                            return (
                                <ListItem key={`ErrorMessage_${index}`}>
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {error.title}
                                    </Typography>
                                    : {error.detail}
                                </ListItem>
                            );
                        })}
                    </List>
                )}
                {logToken ? (
                    <Box
                        sx={{
                            width: '100%',
                            height: 250,
                        }}
                    >
                        <ErrorBoundryWrapper>
                            <Logs token={logToken} />
                        </ErrorBoundryWrapper>
                    </Box>
                ) : null}
            </Alert>
        </Box>
    );
}

export default NewCaptureError;
