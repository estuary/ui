/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Editor } from '@monaco-editor/react';
import { Box, Button, LinearProgress, useTheme } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import { useEntityType } from 'context/EntityContext';
import { monacoEditorComponentBackground } from 'context/Theme';
import { useJournalData } from 'hooks/journals/useJournalData';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { stringifyJSON } from 'services/stringify';

function Ops() {
    const theme = useTheme();

    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const collectionName = `ops.us-central1.v1/logs`;
    const name = `${collectionName}/kind=${entityType}/name=${encodeURIComponent(
        catalogName
    )}/pivot=00`;

    const journalData = useJournalData(name, 20, collectionName);

    return (
        <Box>
            <UnderDev />
            {journalData.loading ? <LinearProgress /> : null}
            <Box>
                <Button onClick={journalData.refresh}>Refresh</Button>
                <Editor
                    height={400}
                    defaultValue="loading..."
                    value={stringifyJSON(journalData)}
                    defaultLanguage="json"
                    theme={monacoEditorComponentBackground[theme.palette.mode]}
                    saveViewState={false}
                    path={name}
                    options={{ readOnly: true }}
                />
            </Box>
        </Box>
    );
}

export default Ops;
