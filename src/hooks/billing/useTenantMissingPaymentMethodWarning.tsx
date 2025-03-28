import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { NavLink, useLocation } from 'react-router-dom';

import {
    getPaymentMethodsForTenants,
    MultiplePaymentMethods,
} from 'src/api/billing';
import { authenticatedRoutes } from 'src/app/routes';
import { useTenantBillingDetails } from 'src/context/fetcher/TenantBillingDetails';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketConsole } from 'src/services/shared';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'src/stores/NotificationStore';
import { Schema } from 'src/types';
import { basicSort_string, getPathWithParams } from 'src/utils/misc-utils';

const TRIAL_LENGTH = 30;

// TODO (payment method notification) we should eventually move the "component type stuff" out of here
//      and into a component that this hook can interact with. This should go into the PaymentMethodWarning.tsx file

// TODO (store payment method info) we load the same thing twice for this and billing. Billing should try to pull these first
function useTenantMissingPaymentMethodWarning() {
    const { pathname } = useLocation();

    const showedNotificationOnce = useRef(false);

    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const hideNotification = useNotificationStore(
        notificationStoreSelectors.hideNotification
    );

    const { tenantBillingDetails } = useTenantBillingDetails();
    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    const [paymentMethods, setPaymentMethods] =
        useState<MultiplePaymentMethods | null>(null);

    const alreadyOnBilling = useMemo(
        () => pathname.startsWith(authenticatedRoutes.admin.billing.fullPath),
        [pathname]
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!hasSupportRole && tenantBillingDetails) {
                setPaymentMethods(
                    await getPaymentMethodsForTenants(tenantBillingDetails)
                );
            }
        };

        void fetchData();
    }, [hasSupportRole, tenantBillingDetails]);

    useEffect(() => {
        if (
            showedNotificationOnce.current ||
            !tenantBillingDetails ||
            !paymentMethods
        ) {
            return;
        }

        // Log if there was _some_ errors. However, do not stop because one call could fail and another succeeds
        if (paymentMethods.errors.length > 0) {
            logRocketConsole(
                'useTenantMissingPaymentMethodWarning: unable to fetch payment methods for tenants'
            );
        }

        // Find all the tenants the user can access that are in the trial period
        const tenantsInTrial = tenantBillingDetails
            .filter((tenantDetail) => tenantDetail.trial_start)
            .sort((first, second) =>
                basicSort_string(first.trial_start, second.trial_start, 'asc')
            );

        // If there are no tenants in trial then we are good and can move on
        if (tenantsInTrial.length === 0) {
            return;
        }

        // We have tenant in trial and now need to go through all the payment methods and see if any are missing
        if (paymentMethods.responses.length > 0) {
            //  Step through the responses we have to see if the tenant is missing details
            //      we do not step through the tenants so if any calls to fetch payment methods
            //      failed we do not show a warning accidently
            paymentMethods.responses.some((paymentMethodForTenant) => {
                const currentTenant = paymentMethodForTenant.tenant;

                const tenantInTrial = tenantsInTrial.find(
                    (tenantInTrialCurr) => {
                        return tenantInTrialCurr.tenant === currentTenant;
                    }
                );

                // We can skip if there are no tenant details found
                // We skip those not in a trial OR have payment methods outside our provider
                if (
                    !tenantInTrial ||
                    paymentMethodForTenant?.skipPaymentMethod
                ) {
                    return false;
                }

                // We check the methods list and see if one exists. We are not checking if a primary card is set
                //   at this time (Q4 2023) but that might change based on experience.
                const hasPaymentMethod =
                    paymentMethodForTenant?.payment_methods &&
                    paymentMethodForTenant.payment_methods.length > 0;

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

                    // If a trial is set to a future date just ignore for now
                    if (trialStart > today) {
                        return true;
                    }

                    // See how many days we have left
                    const daysLeft =
                        today <= trialEnd
                            ? trialEnd.diff(today, 'days').days
                            : -1;

                    // Since if we have daysleft so we can set the alert as a warning and not an error
                    const trialCurrent = daysLeft > 0;

                    const descriptionID = trialCurrent
                        ? 'notifications.paymentMethods.missing.trialCurrent'
                        : daysLeft === 0
                          ? 'notifications.paymentMethods.missing.trialEndsToday'
                          : 'notifications.paymentMethods.missing.trialPast';

                    // Just always pass the same values even if all the messages do not need them
                    const descriptionValues: Schema = {
                        daysLeft,
                        tenant: (
                            <Box
                                component="span"
                                sx={{
                                    fontWeight: 'bold',
                                }}
                            >
                                {currentTenant}
                            </Box>
                        ),
                    };

                    const cta = alreadyOnBilling ? (
                        <FormattedMessage id="notifications.paymentMethods.missing.cta.alreadyThere" />
                    ) : (
                        <NavLink
                            onClick={() => {
                                hideNotification();
                            }}
                            to={getPathWithParams(
                                authenticatedRoutes.admin.billing.addPayment
                                    .fullPath,
                                {
                                    [GlobalSearchParams.PREFIX]: currentTenant,
                                }
                            )}
                        >
                            <FormattedMessage id="notifications.paymentMethods.missing.cta" />
                        </NavLink>
                    );

                    // Show notification and disable auto hide so the user has to manually close it
                    showNotification({
                        options: {
                            autoHideDuration: null,
                        },
                        disableClickAwayClose: true,
                        severity: trialCurrent ? 'warning' : 'error',
                        description: (
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <Box>
                                    <FormattedMessage
                                        id={descriptionID}
                                        values={descriptionValues}
                                    />
                                </Box>
                                <Box>
                                    <FormattedMessage
                                        id={`${descriptionID}.instructions`}
                                        values={{
                                            cta,
                                        }}
                                    />
                                </Box>
                            </Stack>
                        ),
                        title: (
                            <Typography sx={{ fontWeight: 'bold' }}>
                                <FormattedMessage id="notifications.paymentMethods.missing.title" />
                            </Typography>
                        ),
                    });

                    showedNotificationOnce.current = true;
                    return true;
                }

                return false;
            });
        }
    }, [
        alreadyOnBilling,
        hideNotification,
        paymentMethods,
        showNotification,
        tenantBillingDetails,
    ]);

    return paymentMethods;
}

export default useTenantMissingPaymentMethodWarning;
