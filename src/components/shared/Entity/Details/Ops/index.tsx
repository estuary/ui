import { Box, Stack } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import Message from 'src/components/shared/Error/Message';
import LogsTable from 'src/components/tables/Logs';
import useDetailsEntityTaskTypes from 'src/hooks/details/useDetailsEntityTaskTypes';
import useEntityShouldShowLogs from 'src/hooks/details/useEntityShouldShowLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { BASE_ERROR } from 'src/services/supabase';
import JournalHydrator from 'src/stores/JournalData/Hydrator';
import JournalDataLogsHydrator from 'src/stores/JournalData/Logs/Hydrator';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

// TODO: Display the logs table in a loading state until the initial journal
//   data can be fetched.
function Ops() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const taskTypes = useDetailsEntityTaskTypes();

    const hydrationError = useJournalDataLogsStore(
        (state) => state.hydrationError
    );

    const shouldShowLogs = useEntityShouldShowLogs();

    if (!shouldShowLogs) {
        return (
            <AlertBox short severity="warning">
                <FormattedMessage id="ops.shouldNotShowLogs" />
            </AlertBox>
        );
    }

    return (
        <JournalHydrator
            catalogName={catalogName}
            isCollection={taskTypes.length === 0}
        >
            <JournalDataLogsHydrator>
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
        </JournalHydrator>
    );
}

export default Ops;
