import { useTenantDetails } from 'context/fetcher/Tenant';
import {
    getPaymentMethodsForTenants,
    MultiplePaymentMethods,
} from 'api/billing';
import { useEffect, useState } from 'react';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { Box, Chip, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { NavLink } from 'react-router-dom';

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
                const paymentMethodsResponse =
                    await getPaymentMethodsForTenants(tenantDetails);
                setPaymentMethods(paymentMethodsResponse);
            }
        };

        void fetchData();
    }, [tenantDetails]);

    useEffect(() => {
        if (paymentMethods && paymentMethods.errors.length > 0) {
            console.log('had issues fetching payment methods');
            showNotification({
                description: (
                    <Box>
                        <Chip label="something" /> is missing payment
                        information and has an unpaid invoice. This can lead to
                        the tenant being disabled if not corrected in a timely
                        manner. Please provide your payment details by{' '}
                        <NavLink
                            to={authenticatedRoutes.admin.billing.fullPath}
                        >
                            clicking here
                        </NavLink>
                        .
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

        console.log('fetched payment methods', paymentMethods);
    }, [paymentMethods, showNotification]);

    return paymentMethods;
}

export default useTenantMissingPaymentMethodWarning;
