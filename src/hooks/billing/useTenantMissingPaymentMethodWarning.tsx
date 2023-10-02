import { useTenantDetails } from 'context/fetcher/Tenant';
import {
    getPaymentMethodsForTenants,
    MultiplePaymentMethods,
} from 'api/billing';
import { useEffect, useState } from 'react';
import { hasLength } from 'utils/misc-utils';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { Box, Typography } from '@mui/material';
import { logRocketConsole } from 'services/logrocket';
import { DateTime } from 'luxon';

const TRIAL_LENGTH = 30;

function useTenantMissingPaymentMethodWarning() {
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const tenantDetails = useTenantDetails();

    const [paymentMethods, setPaymentMethods] =
        useState<MultiplePaymentMethods | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (tenantDetails) {
                setPaymentMethods(
                    await getPaymentMethodsForTenants(tenantDetails)
                );
            }
        };

        void fetchData();
    }, [tenantDetails]);

    useEffect(() => {
        if (!tenantDetails || !paymentMethods) {
            return;
        }

        // Log if there was _some_ errors. However, do not stop because one call could fail and another succeeds
        if (paymentMethods.errors.length > 0) {
            logRocketConsole(
                'useTenantMissingPaymentMethodWarning: unable to fetch payment methods for tenants'
            );
        }

        // Find all the tenants the user can access that are in the trial period
        const tenantsInTrial = tenantDetails.filter(
            (tenantDetail) => tenantDetail.trial_start
        );

        // If there are no tenants in trial then we are good and can move on
        if (tenantsInTrial.length === 0) {
            return;
        }

        // We have tenant in trial and now need to go through all the payment methods and see if any are missing
        if (paymentMethods.responses.length > 0) {
            // Go through each tenant to try to find the payment methods
            tenantsInTrial.some((tenantInTrial) => {
                const currentTenant = tenantInTrial.tenant;

                // Find the payment method for this tenant
                const paymentMethodForTenant = paymentMethods.responses.find(
                    (paymentMethod) => {
                        return currentTenant === paymentMethod.tenant;
                    }
                );

                // We check the methods list and see if one exists. We are not checking if a primary card is set
                //   at this time (Q4 2023) but that might change based on experience.
                const hasPaymentMethod = hasLength(
                    paymentMethodForTenant.payment_methods
                );

                if (!hasPaymentMethod) {
                    // Make sure we fetch everything as utc and start of day
                    //   so we can easily ignore hours/mins/etc.
                    const today = DateTime.utc().startOf('day');
                    const trialStart = DateTime.fromISO(
                        tenantInTrial.trial_start,
                        { zone: 'utc' }
                    ).startOf('day');
                    const trialEnd = trialStart
                        .plus({
                            days: TRIAL_LENGTH,
                        })
                        .startOf('day');

                    if (today > trialEnd) {
                        showNotification({
                            description: `${currentTenant} is accruing charges without a payment method. Please provide a method as soon as possible.`,
                            severity: 'error',
                            title: (
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    Missing payment information
                                </Typography>
                            ),
                            options: {
                                autoHideDuration: null,
                            },
                        });
                    } else {
                        const daysLeft = today.diff(trialEnd, 'days').days;

                        showNotification({
                            description: (
                                <Box>
                                    <Typography sx={{ fontWeight: 'bold' }}>
                                        {currentTenant}
                                    </Typography>
                                    is in the free trial but have no payment
                                    methods saved. You have {daysLeft} of{' '}
                                    {TRIAL_LENGTH} days left. Please provide a
                                    method before the trial ends.
                                </Box>
                            ),
                            severity: 'error',
                            title: (
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    Missing payment information
                                </Typography>
                            ),
                            options: {
                                autoHideDuration: null,
                            },
                        });
                    }

                    return true;
                }

                return true;
            });
        }
    }, [paymentMethods, showNotification, tenantDetails]);

    return paymentMethods;
}

export default useTenantMissingPaymentMethodWarning;
