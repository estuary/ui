import { useMemo } from 'react';

import { isSameMonth } from 'date-fns';
import { FormattedMessage, useIntl } from 'react-intl';
import useConstant from 'use-constant';

import { Skeleton, Typography } from '@mui/material';

import { BillingRecord } from 'api/billing';

import {
    useBilling_billingHistory,
    useBilling_hydrated,
} from 'stores/Billing/hooks';

import { FREE_GB_BY_TIER } from 'utils/billing-utils';

function PricingTierDetails() {
    const intl = useIntl();

    const today = useConstant(() => new Date());

    // Billing Store
    const billingStoreHydrated = useBilling_hydrated();
    const billingHistory = useBilling_billingHistory();

    const latestBillingRecord: BillingRecord | undefined = useMemo(() => {
        if (billingHistory.length > 0) {
            const evaluatedBillingRecord = billingHistory.find((record) => {
                const billedMonth = new Date(record.billed_month);

                return isSameMonth(billedMonth, today);
            });

            return evaluatedBillingRecord
                ? evaluatedBillingRecord
                : billingHistory[0];
        } else {
            return undefined;
        }
    }, [billingHistory, today]);

    if (latestBillingRecord) {
        const { line_items } = latestBillingRecord;

        return (
            <Typography>
                <FormattedMessage
                    id="admin.billing.message.paidTier"
                    values={{
                        pricingTier: intl.formatMessage({
                            id: 'admin.billing.tier.personal',
                        }),
                        gbFree: FREE_GB_BY_TIER.PERSONAL,
                        taskRate: line_items[1].rate / 100,
                    }}
                />
            </Typography>
        );
    } else if (!billingStoreHydrated) {
        return (
            <Skeleton>
                <Typography>
                    <FormattedMessage id="admin.billing.message.paidTier" />
                </Typography>
            </Skeleton>
        );
    } else {
        // TODO (billing): Replace the hardcoded message with the commented out alert once
        //   the new RPC is integrated. That integration coincides with logic that handles
        //   this fallthrough scenario more effectively.
        return (
            <Typography>
                <FormattedMessage
                    id="admin.billing.message.paidTier"
                    values={{
                        pricingTier: intl.formatMessage({
                            id: 'admin.billing.tier.personal',
                        }),
                        gbFree: FREE_GB_BY_TIER.PERSONAL,
                        taskRate: 20,
                    }}
                />
            </Typography>

            // <Box sx={{ mt: 2 }}>
            //     <AlertBox short severity="warning">
            //         <Typography component="div">
            //             <MessageWithLink messageID="admin.billing.error.undefinedPricingTier" />
            //         </Typography>
            //     </AlertBox>
            // </Box>
        );
    }
}

export default PricingTierDetails;
