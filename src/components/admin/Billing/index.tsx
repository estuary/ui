import type { Theme } from '@mui/material';
import type { AdminBillingProps } from 'src/components/admin/Billing/types';

import { useCallback } from 'react';

import {
    alpha,
    Box,
    Stack,
    Tab,
    tabClasses,
    Tabs,
    tabsClasses,
} from '@mui/material';

import { ErrorBoundary } from 'react-error-boundary';
import { useSearchParams } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import { Overview } from 'src/components/admin/Billing/overview/Overview';
import { UsageTab } from 'src/components/admin/Billing/usage/UsageTab';
import AlertBox from 'src/components/shared/AlertBox';
import TenantSelector from 'src/components/shared/TenantSelector';
import { useBillingAccess } from 'src/hooks/billing/useBillingAccess';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useTenantStore } from 'src/stores/Tenant';

const routeTitle = authenticatedRoutes.admin.billing.title;

type BillingTab = 'overview' | 'usage';

// Overview is the default, so only the usage tab shows in the URL.
const TAB_PARAM = 'tab';

// The same filled pills as `NavigationTabs`, which navigates by path.
const tabsSx = {
    minHeight: 0,
    [`& .${tabsClasses.indicator}`]: { display: 'none' },
    [`& .${tabsClasses.flexContainer}`]: { gap: 1 },
    [`& .${tabClasses.root}`]: {
        borderRadius: 2,
        minHeight: 0,
        p: 1,
        textTransform: 'none',
    },
    [`& .${tabClasses.root}:hover:not(.${tabClasses.selected})`]: {
        backgroundColor: 'action.hover',
    },
    [`& .${tabClasses.selected}`]: {
        backgroundColor: (theme: Theme) =>
            alpha(
                theme.palette.primary.main,
                theme.palette.mode === 'light' ? 0.09 : 0.2
            ),
    },
};

interface BillingForTenantProps extends AdminBillingProps {
    tenant: string;
    tab: BillingTab;
    onShowUsage: () => void;
}

function BillingForTenant({
    tenant,
    tab,
    showAddPayment,
    onShowUsage,
}: BillingForTenantProps) {
    const access = useBillingAccess(tenant);

    if (access.error) {
        return (
            <AlertBox short severity="error">
                There was an error loading your billing permissions. Please try
                again later.
            </AlertBox>
        );
    }

    if (access.isLoading) {
        return null;
    }

    if (!access.canView) {
        return (
            <AlertBox short severity="warning">
                You don&apos;t have permission to view billing for {tenant}.
            </AlertBox>
        );
    }

    // Each card shows its own errors. This boundary only catches the
    // unexpected.
    return (
        <ErrorBoundary
            fallback={
                <AlertBox short severity="error">
                    There was an error loading your billing information. Please
                    try again later.
                </AlertBox>
            }
            onError={(error, { componentStack }) => {
                logRocketEvent(CustomEvents.ERROR_BOUNDARY_DISPLAYED, {
                    area: 'Billing',
                    message: error.message,
                    stack: error.stack,
                    componentStack,
                });
            }}
        >
            {tab === 'usage' ? (
                <UsageTab tenant={tenant} />
            ) : (
                <Overview
                    tenant={tenant}
                    canEdit={access.canEdit}
                    canEditAlerts={access.canEditAlerts}
                    showAddPayment={showAddPayment}
                    onShowUsage={onShowUsage}
                />
            )}
        </ErrorBoundary>
    );
}

function AdminBilling({ showAddPayment }: AdminBillingProps) {
    usePageTitle({
        header: routeTitle,
        headerLink: 'https://www.estuary.dev/pricing/',
    });

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [searchParams, setSearchParams] = useSearchParams();
    const tab: BillingTab =
        searchParams.get(TAB_PARAM) === 'usage' ? 'usage' : 'overview';

    const showTab = useCallback(
        (value: BillingTab) =>
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value === 'usage') {
                    next.set(TAB_PARAM, value);
                } else {
                    next.delete(TAB_PARAM);
                }
                return next;
            }),
        [setSearchParams]
    );

    return (
        <Stack spacing={2.5} sx={{ py: 2 }}>
            <Stack
                direction="row"
                sx={{
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    columnGap: 3,
                    rowGap: 1.5,
                }}
            >
                <Tabs
                    aria-label="Billing"
                    value={tab}
                    onChange={(_event, value: BillingTab) => showTab(value)}
                    sx={tabsSx}
                >
                    <Tab label="Overview" value="overview" />
                    <Tab label="Usage" value="usage" />
                </Tabs>

                <Box sx={{ display: 'flex', width: { xs: '100%', sm: 280 } }}>
                    <TenantSelector />
                </Box>
            </Stack>

            {/* The selector picks a tenant once the user's tenants load. It lists only tenants with a legacy admin grant, which billing-only users lack. */}
            {selectedTenant ? (
                // Remount per tenant so one tenant's results and errors never
                // show for the next.
                <BillingForTenant
                    key={selectedTenant}
                    tenant={selectedTenant}
                    tab={tab}
                    showAddPayment={showAddPayment}
                    onShowUsage={() => showTab('usage')}
                />
            ) : null}
        </Stack>
    );
}

export default AdminBilling;
