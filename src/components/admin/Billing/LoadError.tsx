import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';

function BillingLoadError() {
    const { errorExists } = useBillingInvoices();

    if (!errorExists) {
        return null;
    }

    return (
        <AlertBox
            short
            severity="warning"
            title={<FormattedMessage id="admin.billing.error.details.header" />}
        >
            <FormattedMessage id="admin.billing.error.details.message" />
        </AlertBox>
    );
}

export default BillingLoadError;
