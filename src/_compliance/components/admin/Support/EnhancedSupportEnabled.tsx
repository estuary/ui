import { Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import { usePrivacySettingStore } from 'src/_compliance/stores/usePrivacySettingStore';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import AlertBox from 'src/components/shared/AlertBox';

function EnhancedSupportEnabled() {
    const intl = useIntl();

    const { enhancedSupportExpiration, setPrivacySettings } =
        usePrivacySettings();
    const [updatingSetting] = usePrivacySettingStore((state) => {
        return [state.updatingSetting];
    });

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
