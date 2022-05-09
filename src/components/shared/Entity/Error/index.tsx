import { Alert, AlertTitle, Box } from '@mui/material';
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
                sx={{
                    'width': '100%',
                    '& .MuiAlert-message': { width: '100%' },
                }}
                severity="error"
            >
                <AlertTitle>
                    <FormattedMessage id={title} />
                </AlertTitle>
                <Error error={error} hideTitle={true} />
                {draftId ? <DraftErrors draftId={draftId} /> : null}
                <ErrorLogs logToken={logToken} />
            </Alert>
        </Box>
    );
}

export default EntityError;
