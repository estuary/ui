import { Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import ShardsDisableForm from 'src/components/editor/Shards/Disable/Form';
import ShardsDisableWarning from 'src/components/editor/Shards/Disable/Warning';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';

function ShardsDisable() {
    const entityType = useEntityType();

    const draftId = useEditorStore_persistedDraftId();

    if (!draftId) {
        return null;
    }

    return (
        <>
            <ShardsDisableWarning />

            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography style={{ fontWeight: 500 }}>
                    <FormattedMessage
                        id="workflows.disable.title"
                        values={{ entityType }}
                    />
                </Typography>

                <Typography component="div">
                    <FormattedMessage
                        id="workflows.disable.message"
                        values={{ entityType }}
                    />
                </Typography>
            </Stack>

            <ShardsDisableForm />
        </>
    );
}

export default ShardsDisable;
