import { Editor } from '@monaco-editor/react';
import {
    Box,
    Button,
    LinearProgress,
    List,
    ListItemText,
    Stack,
    useTheme,
} from '@mui/material';
import JournalAlerts from 'components/journals/Alerts';
import UnderDev from 'components/shared/UnderDev';
import { monacoEditorComponentBackground } from 'context/Theme';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useMemo } from 'react';
import { stringifyJSON } from 'services/stringify';

const docsRequested = 25;

function Ops() {
    const theme = useTheme();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const [name, collectionName] = useJournalNameForLogs(catalogName);

    const journalData = useJournalData(name, docsRequested, collectionName);

    const editorValue = useMemo(
        () => stringifyJSON(journalData),
        [journalData]
    );

    return (
        <Box>
            <UnderDev />
            <Box>
                <Button onClick={journalData.refresh}>Refresh</Button>
                <Stack>
                    {journalData.loading ? <LinearProgress /> : null}
                    <List>
                        <ListItemText
                            primary="Documents"
                            secondary={journalData.data?.documents.length}
                        />
                    </List>

                    <JournalAlerts
                        journalData={journalData}
                        journalsData={undefined}
                        notFoundTitleMessage="foo"
                    />

                    <Editor
                        height={400}
                        value={editorValue}
                        defaultLanguage="json"
                        theme={
                            monacoEditorComponentBackground[theme.palette.mode]
                        }
                        saveViewState={false}
                        path={name}
                        options={{ readOnly: true }}
                    />
                </Stack>
            </Box>
        </Box>
    );
}

export default Ops;
