import { Button, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import RecordingConsentModal from 'src/_compliance/components/admin/Support/RecordingConsentModal';
import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';

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
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <AlertBox
                        short
                        severity="success"
                        title="Enhanced Support Enabled"
                    >
                        {intl.formatMessage(
                            {
                                id: 'supportConsent.enhancedSupport.enabled',
                            },
                            {
                                expiration: enhancedSupportExpiration,
                            }
                        )}
                    </AlertBox>
                    <Button onClick={revokeAccess} color="error" variant="text">
                        Revoke
                    </Button>
                </Stack>
            ) : (
                <RecordingConsentModal />
            )}
        </CardWrapper>
    );
}

export default EnhancedSupportChip;
