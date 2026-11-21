import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';

import { InvoicesCard } from 'src/components/admin/Billing/overview/InvoicesCard';
import { PaymentCard } from 'src/components/admin/Billing/overview/PaymentCard';
import { PlanCard } from 'src/components/admin/Billing/overview/PlanCard';
import { SpendAlertCard } from 'src/components/admin/Billing/overview/SpendAlert/SpendAlertCard';
import { ThisMonthCard } from 'src/components/admin/Billing/overview/ThisMonthCard';
import PaymentMethods from 'src/components/admin/Billing/PaymentMethods';
import { useBillingMonthToDate } from 'src/hooks/billing/useBillingMonthToDate';
import { useBillingPlan } from 'src/hooks/billing/useBillingPlan';
import { useBillingPreviewInvoice } from 'src/hooks/billing/useBillingPreviewInvoice';
import { useSpendAlert } from 'src/hooks/billing/useSpendAlert';

interface Props {
    tenant: string;
    // EditBilling, for payment methods and the billing contact.
    canEdit: boolean;
    // Admin, which changing the tenant's alert config requires.
    canEditAlerts: boolean;
    // The add-payment route starts adding a payment method on arrival.
    showAddPayment?: boolean;
    onShowUsage: () => void;
}

export function Overview({
    tenant,
    canEdit,
    canEditAlerts,
    showAddPayment,
    onShowUsage,
}: Props) {
    const plan = useBillingPlan(tenant);
    const monthToDate = useBillingMonthToDate(tenant);
    const preview = useBillingPreviewInvoice(tenant);
    const spendAlert = useSpendAlert(tenant, {
        checkRecipients: canEditAlerts,
    });

    const [paymentMethods, setPaymentMethods] = useState<
        'adding' | 'managing' | null
    >(showAddPayment ? 'adding' : null);

    // Internal tenants aren't billed, so they have no spend alert or payment.
    // Waiting for the plan keeps those cards from flashing for them.
    const billed = !plan.isLoading && plan.plan?.__typename !== 'InternalPlan';

    return (
        <Stack spacing={2.5}>
            <PlanCard
                tenant={tenant}
                plan={plan}
                monthToDate={monthToDate}
                preview={preview}
                canEdit={canEdit}
                onAddPaymentMethod={() => setPaymentMethods('adding')}
            />

            <ThisMonthCard
                tenant={tenant}
                plan={plan}
                preview={preview}
                monthToDate={monthToDate}
                // The amount is kept after the alert is disabled.
                alertCents={spendAlert.enabled ? spendAlert.amountCents : null}
                onShowUsage={onShowUsage}
            />

            {billed ? (
                <SpendAlertCard
                    tenant={tenant}
                    canEdit={canEditAlerts}
                    spendAlert={spendAlert}
                    chargesCents={monthToDate.monthToDate?.chargesCents ?? null}
                />
            ) : null}

            <InvoicesCard tenant={tenant} plan={plan.plan} />

            {billed ? (
                <PaymentCard
                    tenant={tenant}
                    plan={plan.plan}
                    canEdit={canEdit}
                    onManagePaymentMethods={(add) =>
                        setPaymentMethods(add ? 'adding' : 'managing')
                    }
                />
            ) : null}

            {/* The dialog mounts its content only while open, so each opening requests a fresh Stripe setup intent. */}
            {canEdit ? (
                <Dialog
                    open={paymentMethods !== null}
                    onClose={() => setPaymentMethods(null)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Payment methods</DialogTitle>

                    <DialogContent>
                        <PaymentMethods
                            canEdit
                            showAddPayment={paymentMethods === 'adding'}
                        />
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button
                            variant="text"
                            onClick={() => setPaymentMethods(null)}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
        </Stack>
    );
}
