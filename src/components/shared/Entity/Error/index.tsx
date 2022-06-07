import { Box, Stack } from '@mui/material';
import DraftErrors, {
    DraftErrorProps,
} from 'components/shared/Entity/Error/DraftErrors';
import ErrorLogs, { ErrorLogsProps } from 'components/shared/Entity/Error/Logs';
import HeaderSummary from 'components/shared/Entity/HeaderSummary';
import Error, { ErrorProps } from 'components/shared/Error';

interface Props {
    title: string;
    error?: ErrorProps['error'];
    logToken?: ErrorLogsProps['logToken'];
    draftId?: DraftErrorProps['draftId'];
}

function EntityError({ logToken, error, title, draftId }: Props) {
    return (
        <HeaderSummary severity="error" title={title}>
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
        </HeaderSummary>
    );
}

export default EntityError;
