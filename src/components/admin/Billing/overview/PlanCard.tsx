import type { ReactNode } from 'react';
import type { BillingPlan } from 'src/api/gql/billing';
import type { PlanChip } from 'src/components/admin/Billing/overview/planSummary';
import type { useBillingMonthToDate } from 'src/hooks/billing/useBillingMonthToDate';
import type { useBillingPlan } from 'src/hooks/billing/useBillingPlan';
import type { useBillingPreviewInvoice } from 'src/hooks/billing/useBillingPreviewInvoice';

import { Box, Button, Chip, Skeleton, Stack, Typography } from '@mui/material';

import {
    paymentMethodLabel,
    primaryPaymentMethod,
} from 'src/components/admin/Billing/overview/paymentMethod';
import {
    planChips,
    planName,
    planSentence,
} from 'src/components/admin/Billing/overview/planSummary';
import { BillingCard } from 'src/components/admin/Billing/shared/BillingCard';
import {
    captionColor,
    cardTitleSx,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import { utcToday } from 'src/components/admin/Billing/shared/format';
import AlertBox from 'src/components/shared/AlertBox';
import { useBillingContact } from 'src/hooks/billing/useBillingContact';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';

const PRICING_URL = 'https://www.estuary.dev/pricing/';

interface PlanRowProps {
    name: ReactNode;
    chips?: PlanChip[];
    sentence: ReactNode;
    action?: ReactNode;
}

function PlanRow({ name, chips = [], sentence, action }: PlanRowProps) {
    return (
        <Stack
            direction="row"
            sx={{
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                columnGap: 3,
                rowGap: 2,
                px: 3,
                py: 2,
            }}
        >
            <Stack spacing={0.25} sx={{ flex: '1 1 380px', minWidth: 0 }}>
                <Stack
                    direction="row"
                    sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}
                >
                    <Typography component="h2" sx={cardTitleSx}>
                        {name}
                    </Typography>
                    {chips.map(({ label, color }) => (
                        <Chip
                            key={label}
                            size="small"
                            variant="outlined"
                            color={color}
                            label={label}
                        />
                    ))}
                </Stack>

                <Typography
                    component="div"
                    sx={{
                        ...numericSx,
                        color: captionColor,
                        lineHeight: 1.55,
                    }}
                >
                    {sentence}
                </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
                {action}
                <Button
                    variant="outlined"
                    href={PRICING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Pricing
                </Button>
            </Stack>
        </Stack>
    );
}

interface Reads {
    monthToDate: ReturnType<typeof useBillingMonthToDate>;
    preview: ReturnType<typeof useBillingPreviewInvoice>;
}

interface BilledPlanProps extends Reads {
    tenant: string;
    plan: Exclude<BillingPlan, { __typename: 'InternalPlan' }>;
    canEdit: boolean;
    onAddPaymentMethod: () => void;
}

// The sentence for a billed plan names this month's projected invoice and how
// it's paid, from reads the other cards share.
function BilledPlan({
    tenant,
    plan,
    monthToDate,
    preview,
    canEdit,
    onAddPaymentMethod,
}: BilledPlanProps) {
    const payment = useBillingPaymentMethods(tenant);
    const contact = useBillingContact(tenant);

    const today = utcToday();
    const method = primaryPaymentMethod(payment.billing);
    const charged = plan.collectionMethod === 'CHARGE_DEFAULT_PAYMENT_METHOD';
    const selfServe = plan.__typename === 'SelfServePlan' ? plan : null;
    // The free tier and the trial have a fixed sentence.
    const projects = !selfServe || selfServe.phase === 'PAID';

    const loading =
        projects &&
        (monthToDate.isLoading ||
            preview.isLoading ||
            payment.isLoading ||
            contact.isLoading);

    // A trial that pays by card needs one before it ends.
    const needsPaymentMethod =
        canEdit &&
        selfServe?.phase === 'TRIAL' &&
        charged &&
        !payment.isLoading &&
        !payment.error &&
        !method;

    return (
        <PlanRow
            name={planName(plan)}
            chips={planChips(plan, today)}
            sentence={
                loading ? (
                    <Skeleton width="70%" />
                ) : (
                    planSentence({
                        plan,
                        today,
                        projectedSubtotalCents:
                            monthToDate.monthToDate?.projectedSubtotalCents,
                        recurringFeeCents: preview.invoice
                            ? (preview.invoice.extra?.recurring_fee ?? 0)
                            : undefined,
                        paymentMethod: method
                            ? paymentMethodLabel(method)
                            : null,
                        contactEmail: contact.contact?.emails[0] ?? null,
                    })
                )
            }
            action={
                needsPaymentMethod ? (
                    <Button variant="contained" onClick={onAddPaymentMethod}>
                        Add Payment Method
                    </Button>
                ) : null
            }
        />
    );
}

interface Props extends Reads {
    tenant: string;
    plan: ReturnType<typeof useBillingPlan>;
    canEdit: boolean;
    onAddPaymentMethod: () => void;
}

export function PlanCard({
    tenant,
    plan: { plan, error },
    monthToDate,
    preview,
    canEdit,
    onAddPaymentMethod,
}: Props) {
    const today = utcToday();

    return (
        <BillingCard label="Plan">
            {error ? (
                <Box sx={{ px: 3, py: 2 }}>
                    <AlertBox short severity="error">
                        There was an error loading your plan. Please try again
                        later.
                    </AlertBox>
                </Box>
            ) : !plan ? (
                <PlanRow
                    name={<Skeleton width={120} />}
                    sentence={<Skeleton width="60%" />}
                />
            ) : plan.__typename === 'InternalPlan' ? (
                <PlanRow
                    name={planName(plan)}
                    sentence={planSentence({ plan, today })}
                />
            ) : (
                <BilledPlan
                    tenant={tenant}
                    plan={plan}
                    monthToDate={monthToDate}
                    preview={preview}
                    canEdit={canEdit}
                    onAddPaymentMethod={onAddPaymentMethod}
                />
            )}
        </BillingCard>
    );
}
