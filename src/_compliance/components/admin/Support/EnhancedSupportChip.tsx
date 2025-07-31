import { Box, Stack } from '@mui/material';

import RecordingConsentModal from 'src/_compliance/components/admin/Support/RecordingConsentModal';
import useEnhancedSupport from 'src/_compliance/hooks/useEnhancedSupport';
import { truncateTextSx } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function EnhancedSupportChip() {
    const { setEnhancedSupport } = useEnhancedSupport();
    return (
        <Stack direction="row" spacing={2}>
            <OutlinedChip
                // color={sourceCapture ? 'success' : 'info'}
                color="success"
                label={
                    <Box
                        sx={{
                            ...truncateTextSx,
                            minWidth: 100,
                            p: 1,
                        }}
                    >
                        Enhanced Support Enabled (ex: 2025-00-00)
                    </Box>
                }
                onDelete={async () => {
                    setEnhancedSupport(false);
                }}
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
