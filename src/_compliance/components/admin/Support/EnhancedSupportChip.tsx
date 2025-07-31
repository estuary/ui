import { Box, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import RecordingConsentModal from 'src/_compliance/components/admin/Support/RecordingConsentModal';
import SupportWrapper from 'src/_compliance/guards/EnhancedSupport/SupportWrapper';
import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import { truncateTextSx } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function EnhancedSupportChip() {
    const intl = useIntl();
    const { enhancedSupportEnabled, enhancedSupportExpiration, revokeAccess } =
        usePrivacySettings();

    return (
        <SupportWrapper titleMessageId="supportConsent.enhancedSupport.title">
            <Stack direction="row" spacing={2}>
                {enhancedSupportEnabled ? (
                    <OutlinedChip
                        color="success"
                        label={
                            <Box
                                sx={{
                                    ...truncateTextSx,
                                    minWidth: 100,
                                    p: 1,
                                }}
                            >
                                {intl.formatMessage(
                                    {
                                        id: 'supportConsent.enhancedSupport.enabled',
                                    },
                                    {
                                        expiration: enhancedSupportExpiration,
                                    }
                                )}
                            </Box>
                        }
                        onDelete={revokeAccess}
                        style={{
                            maxWidth: 'fit-content',
                            minWidth: 'fit-content',
                            minHeight: 40,
                        }}
                        variant="outlined"
                    />
                ) : (
                    <RecordingConsentModal />
                )}
            </Stack>
        </SupportWrapper>
    );
}

export default EnhancedSupportChip;
