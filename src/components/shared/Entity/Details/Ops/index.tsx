import { Box, Stack } from '@mui/material';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import Error from 'components/shared/Error';
import { BASE_ERROR } from 'services/supabase';
import LogsTable from 'components/tables/Logs';
import useOpsLogs from 'hooks/journals/useOpsLogs';

function Ops() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    const {
        docs,
        error,
        fetchingMore,
        loading,
        lastParsed,
        olderFinished,
        refresh,
    } = useOpsLogs(name, collectionName);

    return (
        <Stack spacing={2}>
            {error ? (
                <Error
                    error={{
                        ...BASE_ERROR,
                        message: error.message,
                    }}
                    condensed
                />
            ) : null}

            <Box>
                <LogsTable
                    documents={docs}
                    loading={fetchingMore || loading}
                    fetchNewer={() => {
                        refresh();
                        console.log('fetch newer logs');
                    }}
                    fetchOlder={
                        olderFinished
                            ? undefined
                            : () => {
                                  console.log('fetch older logs');

                                  refresh({
                                      offset: 0,
                                      endOffset: lastParsed,
                                  });
                              }
                    }
                />
            </Box>
        </Stack>
    );
}

export default Ops;
