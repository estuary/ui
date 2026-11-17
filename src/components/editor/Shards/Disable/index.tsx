import { Stack, Typography } from '@mui/material';

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
                    {`Enable ${entityType}`}
                </Typography>

                <Typography component="div">
                    {`Control whether your ${entityType} is disabled. This setting takes effect when your changes are published.`}
                </Typography>
            </Stack>

            <ShardsDisableForm />
        </>
    );
}

export default ShardsDisable;
