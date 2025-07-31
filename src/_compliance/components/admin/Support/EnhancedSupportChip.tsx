import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import RecordingConsentModal from 'src/_compliance/components/admin/Support/RecordingConsentModal';
import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import CardWrapper from 'src/components/shared/CardWrapper';
import { truncateTextSx } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function EnhancedSupportChip() {
    const intl = useIntl();
    const { enhancedSupportEnabled, enhancedSupportExpiration, revokeAccess } =
        usePrivacySettings();

    return (
        <CardWrapper
            message={intl.formatMessage({
                id: 'supportConsent.enhancedSupport.title',
            })}
        >
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
        </CardWrapper>
    );
}

export default EnhancedSupportChip;
