import type { BillingPlan } from 'src/api/gql/billing';
import type { BillingPaymentMethodFieldsFragment } from 'src/gql-types/graphql';

import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';

import { BillingContactSection } from 'src/components/admin/Billing/BillingContactSection';
import {
    describePaymentMethod,
    primaryPaymentMethod,
} from 'src/components/admin/Billing/overview/paymentMethod';
import { PaymentRow } from 'src/components/admin/Billing/overview/PaymentRow';
import { cardLogos } from 'src/components/admin/Billing/PaymentMethodRow';
import { BillingCard } from 'src/components/admin/Billing/shared/BillingCard';
import {
    captionColor,
    captionSx,
    CardHeader,
    numericSx,
    ruleSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import AlertBox from 'src/components/shared/AlertBox';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';

const noPaymentMethod = (plan: BillingPlan | undefined) => {
    if (plan?.__typename === 'SelfServePlan' && plan.phase === 'FREE') {
        return 'None needed on the free tier';
    }

    return plan &&
        plan.__typename !== 'InternalPlan' &&
        plan.collectionMethod === 'SEND_INVOICE'
        ? 'Paid by invoice'
        : 'None yet';
};

function PaymentMethodSummary({
    method,
}: {
    method: BillingPaymentMethodFieldsFragment;
}) {
    const { card } = method;
    const { name, last4 } = describePaymentMethod(method);
    const logo = card?.brand ? cardLogos[card.brand] : undefined;

    return (
        <Stack
            direction="row"
            spacing={1.25}
            sx={{ ...numericSx, alignItems: 'center' }}
        >
            {logo ? (
                <Box
                    component="img"
                    src={logo}
                    alt={`${name} logo`}
                    sx={{ height: 20, borderRadius: 0.5 }}
                />
            ) : (
                <span>{name}</span>
            )}

            {last4 ? <span>{`•••• ${last4}`}</span> : null}

            {card ? (
                <Typography
                    component="span"
                    sx={{ ...captionSx, fontSize: 14 }}
                >
                    {`Expires ${String(card.expMonth).padStart(2, '0')}/${String(
                        card.expYear % 100
                    ).padStart(2, '0')}`}
                </Typography>
            ) : null}
        </Stack>
    );
}

interface Props {
    tenant: string;
    plan: BillingPlan | undefined;
    canEdit: boolean;
    // Opens the tenant's payment methods, starting to add one when asked.
    onManagePaymentMethods: (add: boolean) => void;
}

export function PaymentCard({
    tenant,
    plan,
    canEdit,
    onManagePaymentMethods,
}: Props) {
    const { billing, isLoading, error } = useBillingPaymentMethods(tenant);

    const hasMethods = Boolean(billing?.paymentMethods.length);
    const method = primaryPaymentMethod(billing);

    return (
        <BillingCard label="Payment">
            <Box sx={{ px: 3, pt: 2, pb: 0.5 }}>
                <CardHeader title="Payment" />
            </Box>

            <PaymentRow
                caption="Payment method"
                action={
                    canEdit && !isLoading && !error ? (
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => onManagePaymentMethods(!hasMethods)}
                        >
                            {hasMethods ? 'Change' : 'Add Payment Method'}
                        </Button>
                    ) : null
                }
            >
                {error ? (
                    <AlertBox short severity="error">
                        There was an error loading your payment methods. Please
                        try again later.
                    </AlertBox>
                ) : isLoading ? (
                    <Skeleton width={220} />
                ) : method ? (
                    <PaymentMethodSummary method={method} />
                ) : (
                    <Typography sx={{ color: captionColor }}>
                        {hasMethods
                            ? 'No primary payment method'
                            : noPaymentMethod(plan)}
                    </Typography>
                )}
            </PaymentRow>

            <Box sx={ruleSx}>
                <BillingContactSection canEdit={canEdit} />
            </Box>
        </BillingCard>
    );
}
