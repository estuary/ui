import { useTenantDetails } from 'context/fetcher/Tenant';
import {
    getPaymentMethodsForTenants,
    MultiplePaymentMethods,
} from 'api/billing';
import { useEffect, useState } from 'react';
import { find } from 'lodash';
import { UTCDate } from '@date-fns/utc';
import { differenceInCalendarDays } from 'date-fns';
import { convertToUTC } from 'api/stats';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { Typography } from '@mui/material';

function useTenantMissingPaymentMethodWarning() {
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );
    //                     showNotification({
    //                     description: (
    //                         <Box>
    //                             <Chip label={paymentMethodsResponse.tenant} /> is missing payment
    //                             information and has an unpaid invoice. This can
    //                             lead to the tenant being disabled if not
    //                             corrected in a timely manner. Please provide
    //                             your payment details by{' '}
    //                             <NavLink
    //                                 to={
    //                                     authenticatedRoutes.admin.billing
    //                                         .fullPath
    //                                 }
    //                             >
    //                                 clicking here
    //                             </NavLink>
    //                             .
    //                         </Box>
    //                     ),
    //                     severity: 'error',
    //                     title: (
    //                         <Typography sx={{ fontWeight: 'bold' }}>
    //                             Missing payment information
    //                         </Typography>
    //                     ),
    //                     options: {
    //                         autoHideDuration: null,
    //                     },
    //                 });

    const tenantDetails = useTenantDetails();

    const [paymentMethods, setPaymentMethods] =
        useState<MultiplePaymentMethods | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (tenantDetails) {
                const paymentMethodsResponse =
                    await getPaymentMethodsForTenants(tenantDetails);
                setPaymentMethods(paymentMethodsResponse);
            }
        };

        void fetchData();
    }, [tenantDetails]);

    useEffect(() => {
        if (!tenantDetails || !paymentMethods) {
            return;
        }

        if (paymentMethods.errors.length > 0) {
            console.log('had issues fetching payment methods');
        } else if (paymentMethods.responses.length > 0) {
            paymentMethods.responses.some((paymentMethodsResponse) => {
                const details = find(
                    tenantDetails,
                    (tenantDetail) =>
                        tenantDetail.tenant === paymentMethodsResponse.tenant
                );

                const hasPaymentMethod =
                    paymentMethodsResponse.paymentMethods.length > 0;

                // The tenant
                if (details?.trial_start) {
                    const trialStart = convertToUTC(
                        details.trial_start,
                        'daily',
                        true
                    );
                    const trialStartLength = differenceInCalendarDays(
                        trialStart,
                        convertToUTC(new UTCDate(), 'daily', true)
                    );
                    const daysLeft = 30 - trialStartLength;

                    if (!hasPaymentMethod) {
                        if (daysLeft > 0) {
                            showNotification({
                                description: `${paymentMethodsResponse.tenant} is in the free trial but have no payment methods saved. You have ${daysLeft} days left. Please provide a method before the trial ends.`,
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
                            // The trial is over and
                            showNotification({
                                description: `${paymentMethodsResponse.tenant} is accruing charges without a payment method. Please provide a method as soon as possible.`,
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

                    return false;
                }

                return false;
            });
        }

        console.log('fetched payment methods', paymentMethods);
    }, [paymentMethods, showNotification, tenantDetails]);

    return paymentMethods;
}

export default useTenantMissingPaymentMethodWarning;
