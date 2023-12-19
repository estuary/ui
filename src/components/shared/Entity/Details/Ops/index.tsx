import { Box, Button, LinearProgress, Stack, useTheme } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import LogsTable from 'components/tables/Logs';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Editor } from '@monaco-editor/react';
import { stringifyJSON } from 'services/stringify';
import { monacoEditorComponentBackground } from 'context/Theme';
import { useToggle } from 'react-use';

const docsRequested = 25;

function Ops() {
    const theme = useTheme();

    const [showRaw, toggleShowRaw] = useToggle(false);

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);
    const journalData = useJournalData(name, docsRequested, collectionName);

    return (
        <Box>
            <UnderDev />
            <Box>
                <Button onClick={journalData.refresh}>Refresh</Button>
                <Button onClick={toggleShowRaw}>Toggle Raw</Button>
                <Stack>
                    <Box>Documents {journalData.data?.documents.length}</Box>

                    {/*                    <JournalAlerts
                        journalData={journalData}
                        notFoundTitleMessage={
                            <FormattedMessage
                                id="ops.journals.notFound.message"
                                values={{
                                    entityType,
                                }}
                            />
                        }
                    />*/}

                    {journalData.loading ? <LinearProgress /> : null}

                    {showRaw ? (
                        <Editor
                            height={400}
                            value={stringifyJSON(
                                journalData.data?.documents ?? []
                            )}
                            defaultLanguage="json"
                            theme={
                                monacoEditorComponentBackground[
                                    theme.palette.mode
                                ]
                            }
                            saveViewState={false}
                            path={`${catalogName}_logs_raw`}
                            options={{
                                readOnly: true,
                            }}
                        />
                    ) : (
                        <LogsTable
                            documents={journalData.data?.documents ?? []}
                        />
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

export default Ops;
