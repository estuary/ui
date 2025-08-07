import { Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import AlertBox from 'src/components/shared/AlertBox';

function EnhancedSupportEnabled() {
    const intl = useIntl();
    const { enhancedSupportExpiration, setPrivacySettings, updatingSetting } =
        usePrivacySettings();

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'center',
            }}
        >
            <AlertBox short severity="success" title="Enhanced Support Enabled">
                {intl.formatMessage(
                    {
                        id: 'supportConsent.enhancedSupport.enabled',
                    },
                    {
                        expiration: enhancedSupportExpiration,
                    }
                )}
            </AlertBox>
            <SafeLoadingButton
                onClick={() => {
                    setPrivacySettings(false);
                }}
                color="error"
                disabled={updatingSetting}
                loading={updatingSetting}
                variant="text"
            >
                {intl.formatMessage({
                    id: 'supportConsent.enhancedSupport.revoke',
                })}
            </SafeLoadingButton>
        </Stack>
    );
}

export default EnhancedSupportEnabled;
