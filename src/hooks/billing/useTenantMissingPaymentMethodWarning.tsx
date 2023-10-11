import { useTenantDetails } from 'context/fetcher/Tenant';
import {
    getPaymentMethodsForTenants,
    MultiplePaymentMethods,
} from 'api/billing';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPathWithParams, basicSort_string } from 'utils/misc-utils';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { Box, Stack, Typography } from '@mui/material';
import { logRocketConsole } from 'services/logrocket';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { Schema } from 'types';
import { NavLink, useLocation } from 'react-router-dom';
import { authenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';

const TRIAL_LENGTH = 30;

// TODO (payment method notification) we should eventually more the "component type stuff" out of here
//      and into a component that this hook can interact with.

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

    const tenantDetails = useTenantDetails();

    const [paymentMethods, setPaymentMethods] =
        useState<MultiplePaymentMethods | null>(null);

    const alreadyOnBilling = useMemo(
        () => pathname.startsWith(authenticatedRoutes.admin.billing.fullPath),
        [pathname]
    );

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
        if (
            showedNotificationOnce.current ||
            !tenantDetails ||
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
        const tenantsInTrial = tenantDetails
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
            // Go through each tenant to try to find the payment methods
            tenantsInTrial.some((tenantInTrial) => {
                const currentTenant = tenantInTrial.tenant;

                // Find the payment method for this tenant
                const paymentMethodForTenant = paymentMethods.responses.find(
                    (paymentMethod) => {
                        return currentTenant === paymentMethod.tenant;
                    }
                );

                // We skip those tenants with their payments handled outside of our provider
                if (paymentMethodForTenant.paysExternally) {
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
        tenantDetails,
    ]);

    return paymentMethods;
}

export default useTenantMissingPaymentMethodWarning;
