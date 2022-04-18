import { Alert, AlertTitle, Box } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import Logs from 'components/Logs';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { FormattedMessage } from 'react-intl';

type Props = {
    title: string;
    error?: PostgrestError;
    logToken?: string | null;
};

function NewCaptureError({ logToken, error, title }: Props) {
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
                {error ? <Error error={error} hideTitle={true} /> : null}
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
