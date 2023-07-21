import { Box, Divider, Stack } from '@mui/material';

import { useEditorStore_discoveredDraftId } from 'components/editor/Store/hooks';
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
    const discoveredDraftId = useEditorStore_discoveredDraftId();

    // When a user is discovering we need to make sure we show those errors
    //  but we would not want to show then at the same time we show test/pub
    //  draft errors.
    const idForDraftErrors = discoveredDraftId
        ? discoveredDraftId
        : draftId
        ? draftId
        : null;

    return (
        <HeaderSummary severity="error" title={title}>
            <Stack direction="column" spacing={2}>
                <Box>
                    <Error error={error} hideTitle={true} noAlertBox />

                    {idForDraftErrors ? (
                        <>
                            <Divider />
                            <DraftErrors draftId={idForDraftErrors} />
                        </>
                    ) : null}
                </Box>

                <ErrorLogs
                    logToken={logToken}
                    logProps={{
                        fetchAll: true,
                    }}
                />
            </Stack>
        </HeaderSummary>
    );
}

export default EntityError;
