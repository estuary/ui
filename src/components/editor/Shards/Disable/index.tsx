import { Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEntityType } from 'context/EntityContext';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import ShardsDisableForm from './Form';
import ShardsDisableWarning from './Warning';

function ShardsDisable() {
    const forcedToEnable = useGlobalSearchParams(
        GlobalSearchParams.FORCED_SHARD_ENABLE
    );

    const entityType = useEntityType();

    const draftId = useEditorStore_persistedDraftId();

    if (!draftId) {
        return null;
    }

    return (
        <>
            {forcedToEnable ? <ShardsDisableWarning /> : null}

            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="formSectionHeader">
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
