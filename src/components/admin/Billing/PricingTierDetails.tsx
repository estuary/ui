import { Box, Skeleton, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { isSameMonth } from 'date-fns';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useBilling_billingHistory,
    useBilling_hydrated,
} from 'stores/Tables/Billing/hooks';
import { BillingRecord } from 'stores/Tables/Billing/types';
import useConstant from 'use-constant';

function PricingTierDetails() {
    const intl = useIntl();

    const today = useConstant(() => new Date());

    // Billing Store
    const billingStoreHydrated = useBilling_hydrated();
    const billingHistory = useBilling_billingHistory();

    const latestBillingRecord: BillingRecord | undefined = useMemo(() => {
        return billingHistory.find((record) => isSameMonth(record.date, today));
    }, [billingHistory, today]);

    if (
        latestBillingRecord?.pricingTier &&
        latestBillingRecord.gbFree &&
        latestBillingRecord.taskRate
    ) {
        const { pricingTier, gbFree, taskRate } = latestBillingRecord;

        return (
            <Typography>
                <FormattedMessage
                    id="admin.billing.message.paidTier"
                    values={{
                        pricingTier: intl.formatMessage({
                            id: `admin.billing.tier.${pricingTier}`,
                        }),
                        gbFree,
                        taskRate,
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
