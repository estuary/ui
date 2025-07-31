import { Box, Stack } from '@mui/material';

import RecordingConsentModal from 'src/_compliance/components/admin/Support/RecordingConsentModal';
import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import { truncateTextSx } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function EnhancedSupportChip() {
    const { enhancedSupportEnabled, revokeAccess } = usePrivacySettings();

    return (
        <Stack direction="row" spacing={2}>
            <OutlinedChip
                color={enhancedSupportEnabled ? 'success' : 'info'}
                label={
                    <Box
                        sx={{
                            ...truncateTextSx,
                            minWidth: 100,
                            p: 1,
                        }}
                    >
                        {enhancedSupportEnabled
                            ? 'Enhanced Support Enabled (ex: 2025-00-00)'
                            : 'Enhanced Support Disabled'}
                    </Box>
                }
                onDelete={revokeAccess}
                style={{
                    maxWidth: '50%',
                    minHeight: 40,
                }}
                variant="outlined"
            />
            <RecordingConsentModal />
        </Stack>
    );
}

export default EnhancedSupportChip;
