import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ShardsDisableForm from 'src/components/editor/Shards/Disable/Form';
import ShardsDisableWarning from 'src/components/editor/Shards/Disable/Warning';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';

function ShardsDisable() {
    const intl = useIntl();

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
                    {intl.formatMessage(
                        { id: 'workflows.disable.title' },
                        {
                            entityType,
                        }
                    )}
                </Typography>

                <Typography component="div">
                    {intl.formatMessage(
                        { id: 'workflows.disable.message' },
                        {
                            entityType,
                        }
                    )}
                </Typography>
            </Stack>

            <ShardsDisableForm />
        </>
    );
}

export default ShardsDisable;
