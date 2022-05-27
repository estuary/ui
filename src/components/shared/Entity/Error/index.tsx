import { Alert, AlertTitle, Box, Stack } from '@mui/material';
import DraftErrors, {
    DraftErrorProps,
} from 'components/shared/Entity/Error/DraftErrors';
import ErrorLogs, { ErrorLogsProps } from 'components/shared/Entity/Error/Logs';
import Error, { ErrorProps } from 'components/shared/Error';
import { FormattedMessage } from 'react-intl';

interface Props {
    title: string;
    error?: ErrorProps['error'];
    logToken?: ErrorLogsProps['logToken'];
    draftId?: DraftErrorProps['draftId'];
}

function EntityError({ logToken, error, title, draftId }: Props) {
    return (
        <Box sx={{ width: '100%' }}>
            <Alert
                icon={false}
                sx={{
                    'width': '100%',
                    '& .MuiAlert-message': { width: '100%' },
                }}
                severity="error"
            >
                <AlertTitle>
                    <FormattedMessage id={title} />
                </AlertTitle>
                <Stack direction="column" spacing={2}>
                    <Box
                        sx={{
                            overflow: 'auto',
                        }}
                    >
                        <Error error={error} hideTitle={true} />
                        {draftId ? <DraftErrors draftId={draftId} /> : null}
                    </Box>
                    <ErrorLogs logToken={logToken} />
                </Stack>
            </Alert>
        </Box>
    );
}

export default EntityError;
