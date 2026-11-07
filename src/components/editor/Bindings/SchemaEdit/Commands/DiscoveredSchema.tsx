import { Typography } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
} from 'src/components/editor/Store/hooks';

function DiscoveredSchemaCommands() {
    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();

    const pullDraftCommand = `flowctl draft select --id ${persistedDraftId ?? draftId ?? ''} && flowctl draft develop`;

    const pushLocalEditsCommand =
        'flowctl draft author --source <flow_catalog_file_location>';

    return (
        <>
            <Typography sx={{ mb: 3 }}>
                Use the commands below to edit the schema for this collection.
                Once executed, click the Synchronize Schema button below to pull
                the changes on the server into the UI.
            </Typography>

            <Typography sx={{ mb: 1 }}>Pull down the draft to edit</Typography>

            <SingleLineCode value={pullDraftCommand} />

            <Typography sx={{ mt: 3, mb: 1 }}>
                Push your changes up to the server
            </Typography>

            <SingleLineCode value={pushLocalEditsCommand} />
        </>
    );
}

export default DiscoveredSchemaCommands;
