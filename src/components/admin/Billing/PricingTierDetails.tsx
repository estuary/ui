import { Box, Skeleton, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { isSameMonth } from 'date-fns';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useBilling_billingDetails,
    useBilling_hydrated,
} from 'stores/Tables/Billing/hooks';
import { BillingDetails } from 'stores/Tables/Billing/types';
import useConstant from 'use-constant';

function PricingTierDetails() {
    const intl = useIntl();

    const today = useConstant(() => new Date());

    // Billing Store
    const billingStoreHydrated = useBilling_hydrated();
    const billingDetails = useBilling_billingDetails();

    const [pricingTierId, gbFree]: [
        BillingDetails['pricingTier'],
        BillingDetails['gbFree']
    ] = useMemo(() => {
        const latestRecord = billingDetails.find((record) =>
            isSameMonth(record.date, today)
        );

        return latestRecord
            ? [latestRecord.pricingTier, latestRecord.gbFree]
            : [null, null];
    }, [billingDetails, today]);

    if (pricingTierId && gbFree) {
        return (
            <Typography>
                <FormattedMessage
                    id="admin.billing.message.paidTier"
                    values={{
                        pricingTier: intl.formatMessage({
                            id: `admin.billing.tier.${pricingTierId}`,
                        }),
                        taskRate: gbFree,
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
        return (
            <Box sx={{ mt: 2 }}>
                <AlertBox short severity="warning">
                    <Typography component="div">
                        <MessageWithLink messageID="admin.billing.error.undefinedPricingTier" />
                    </Typography>
                </AlertBox>
            </Box>
        );
    }
}

export default PricingTierDetails;
