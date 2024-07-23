import { Box } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';

function BillingLoadError() {
    const hydrationErrorsExist = useBillingStore(
        (state) => state.hydrationErrorsExist
    );

    if (!hydrationErrorsExist) {
        return null;
    }

    return (
        <Box style={{ padding: 2 }}>
            <AlertBox
                short
                severity="warning"
                title={
                    <FormattedMessage id="admin.billing.error.details.header" />
                }
            >
                <FormattedMessage id="admin.billing.error.details.message" />
            </AlertBox>
        </Box>
    );
}

export default BillingLoadError;
