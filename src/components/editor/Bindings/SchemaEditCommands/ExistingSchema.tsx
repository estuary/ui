import { Terminal } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

function ExistingSchemaCommands() {
    const intl = useIntl();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const pullDraftCommands = {
        1: intl.formatMessage(
            {
                id: 'workflows.collectionSelector.schemaEdit.existingCollection.command1',
            },
            {
                draftId: persistedDraftId,
            }
        ),
        2: intl.formatMessage(
            {
                id: 'workflows.collectionSelector.schemaEdit.existingCollection.command2',
            },
            {
                catalogName: currentCollection,
            }
        ),
    };

    const pushLocalEditsCommand = intl.formatMessage({
        id: 'workflows.collectionSelector.schemaEdit.existingCollection.command3',
    });

    return (
        <>
            <Box
                sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Terminal />

                <Typography variant="h6" sx={{ ml: 1 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaEdit.header" />
                </Typography>
            </Box>

            <Typography sx={{ mb: 3 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.description" />
            </Typography>

            <Typography sx={{ mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message1" />
            </Typography>

            <SingleLineCode
                formattedMessage={pullDraftCommands[1]}
                subsequentCommandExists={true}
            />

            <SingleLineCode formattedMessage={pullDraftCommands[2]} />

            <Typography sx={{ mt: 3, mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message2" />
            </Typography>

            <SingleLineCode formattedMessage={pushLocalEditsCommand} />
        </>
    );
}

export default ExistingSchemaCommands;
