import { Box, Stack } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import Message from 'components/shared/Error/Message';
import LogsTable from 'components/tables/Logs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import { BASE_ERROR } from 'services/supabase';
import JournalHydrator from 'stores/JournalData/Hydrator';
import JournalDataLogsHydrator from 'stores/JournalData/Logs/Hydrator';
import { useJournalDataLogsStore } from 'stores/JournalData/Logs/Store';
import { isProduction } from 'utils/env-utils';
import useDetailsEntityTaskTypes from '../useDetailsEntityTaskTypes';
import useEntityShouldShowLogs from '../useEntityShouldShowLogs';

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
                            <>
                                {isProduction ? null : (
                                    <AlertBox severity="warning" short>
                                        With V2 of Control Plane logs in the UI
                                        will not work due to an issue with the
                                        selector.
                                    </AlertBox>
                                )}

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
                            </>
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
