import { Box, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import HydrationErrorAlert from 'src/components/shared/Entity/Details/Ops/HydrationErrorAlert';
import LogsTable from 'src/components/tables/Logs';
import useDetailsEntityTaskTypes from 'src/hooks/details/useDetailsEntityTaskTypes';
import useEntityShouldShowLogs from 'src/hooks/details/useEntityShouldShowLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import JournalHydrator from 'src/stores/JournalData/Hydrator';
import JournalDataLogsHydrator from 'src/stores/JournalData/Logs/Hydrator';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

// TODO: Display the logs table in a loading state until the initial journal
//   data can be fetched.
function Ops() {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const taskTypes = useDetailsEntityTaskTypes();

    const shouldShowLogs = useEntityShouldShowLogs();

    const hydrationError = useJournalDataLogsStore(
        (state) => state.hydrationError
    );

    if (!shouldShowLogs) {
        return (
            <AlertBox short severity="warning">
                {intl.formatMessage({ id: 'ops.shouldNotShowLogs' })}
            </AlertBox>
        );
    }

    return (
        <CardWrapper
            message={intl.formatMessage({
                id: 'ops.logsTable.label',
            })}
        >
            <JournalHydrator
                catalogName={catalogName}
                isCollection={taskTypes.length === 0}
            >
                <JournalDataLogsHydrator>
                    <Stack spacing={2}>
                        <Box>
                            {hydrationError ? (
                                <HydrationErrorAlert
                                    hydrationError={hydrationError}
                                />
                            ) : (
                                <LogsTable />
                            )}
                        </Box>
                    </Stack>
                </JournalDataLogsHydrator>
            </JournalHydrator>
        </CardWrapper>
    );
}

export default Ops;
