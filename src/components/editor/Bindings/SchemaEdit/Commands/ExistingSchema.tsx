import { Typography } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
} from 'src/components/editor/Store/hooks';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';

function ExistingSchemaCommands() {
    // Binding Store
    const currentCollection = useBinding_currentCollection();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();

    const pullDraftCommands = {
        1: `flowctl draft select --id ${persistedDraftId ?? draftId ?? ''}`,
        2: `flowctl catalog draft --name ${currentCollection ?? ''} && flowctl draft develop`,
    };

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

            <SingleLineCode
                value={pullDraftCommands[1]}
                subsequentCommandExists={true}
            />

            <SingleLineCode value={pullDraftCommands[2]} />

            <Typography sx={{ mt: 3, mb: 1 }}>
                Push your changes up to the server
            </Typography>

            <SingleLineCode value={pushLocalEditsCommand} />
        </>
    );
}

export default ExistingSchemaCommands;
