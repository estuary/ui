import { Box, Stack } from '@mui/material';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import LogsTable from 'components/tables/Logs';
import JournalDataLogsHydrator from 'stores/JournalData/Logs/Hydrator';
import { useJournalDataLogsStore_hydrationError } from 'stores/JournalData/Logs/hooks';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';
import Message from 'components/shared/Error/Message';
import { BASE_ERROR } from 'services/supabase';

function Ops() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    const hydrationError = useJournalDataLogsStore_hydrationError();

    console.log('hydrationError', hydrationError);

    return (
        <JournalDataLogsHydrator name={name} collectionName={collectionName}>
            <Stack spacing={2}>
                <Box>
                    {hydrationError ? (
                        <AlertBox
                            severity="error"
                            title={
                                <FormattedMessage id="ops.logsTable.hydrationError" />
                            }
                            short
                        >
                            <Message
                                error={{
                                    ...BASE_ERROR,
                                    message: hydrationError,
                                }}
                            />
                        </AlertBox>
                    ) : (
                        <LogsTable />
                    )}
                </Box>
            </Stack>
        </JournalDataLogsHydrator>
    );
}

export default Ops;
