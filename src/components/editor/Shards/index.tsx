import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ShardsDisable from 'src/components/editor/Shards/Disable';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

interface Props {
    renderOpen: boolean;
}

function ShardsEditor({ renderOpen }: Props) {
    const intl = useIntl();

    const forcedToEnable = useGlobalSearchParams(
        GlobalSearchParams.FORCED_SHARD_ENABLE
    );

    const draftId = useEditorStore_persistedDraftId();

    if (!draftId) {
        return null;
    }

    return (
        <Box sx={{ mb: 3, maxWidth: 'fit-content' }}>
            <WrapperWithHeader
                forceOpen={Boolean(forcedToEnable || renderOpen)}
                header={
                    <Typography>
                        {intl.formatMessage({
                            id: 'workflows.advancedSettings.title',
                        })}
                    </Typography>
                }
            >
                <ShardsDisable />
            </WrapperWithHeader>
        </Box>
    );
}

export default ShardsEditor;
