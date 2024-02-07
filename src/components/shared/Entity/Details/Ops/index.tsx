import { Box, Stack } from '@mui/material';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import LogsTable from 'components/tables/Logs';
import JournalDataLogsHydrator from 'stores/JournalData/Logs/Hydrator';
import { useJournalDataLogsStore_hydrationErrorsExist } from 'stores/JournalData/Logs/hooks';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';
import MessageWithLink from 'components/content/MessageWithLink';

function Ops() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    const hydrationErrorsExist = useJournalDataLogsStore_hydrationErrorsExist();

    return (
        <JournalDataLogsHydrator name={name} collectionName={collectionName}>
            <Stack spacing={2}>
                <Box>
                    {hydrationErrorsExist ? (
                        <AlertBox
                            severity="error"
                            title={
                                <FormattedMessage id="ops.logsTable.hydrationError" />
                            }
                            short
                        >
                            <MessageWithLink messageID="ops.logsTable.hydrationError.message" />
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
