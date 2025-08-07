import { useIntl } from 'react-intl';

import { usePrivacySettingStore } from 'src/_compliance/stores/usePrivacySettingStore';
import AlertBox from 'src/components/shared/AlertBox';

function FormError() {
    const intl = useIntl();
    const [updateError] = usePrivacySettingStore((state) => {
        return [state.updateError];
    });

    if (!updateError) {
        return null;
    }

    return (
        <AlertBox
            severity="error"
            short
            title={intl.formatMessage({ id: 'supportConsent.error.title' })}
        >
            {intl.formatMessage({ id: 'supportConsent.error.message' })}
        </AlertBox>
    );
}

export default FormError;
