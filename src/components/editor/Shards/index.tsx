import { Box, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ShardsDisable from './Disable';

interface Props {
    renderOpen: boolean;
}

function ShardsEditor({ renderOpen }: Props) {
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
                        <FormattedMessage id="workflows.advancedSettings.title" />
                    </Typography>
                }
            >
                <ShardsDisable />
            </WrapperWithHeader>
        </Box>
    );
}

export default ShardsEditor;
