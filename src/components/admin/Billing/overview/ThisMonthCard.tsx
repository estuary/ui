import type { ReactNode } from 'react';
import type {
    BillingPlan,
    Invoice,
    InvoiceLineItem,
} from 'src/api/gql/billing';
import type { UsageMeter } from 'src/components/admin/Billing/overview/priceSteps';
import type { UsageKind } from 'src/components/admin/Billing/shared/format';
import type { useBillingMonthToDate } from 'src/hooks/billing/useBillingMonthToDate';
import type { useBillingPlan } from 'src/hooks/billing/useBillingPlan';
import type { useBillingPreviewInvoice } from 'src/hooks/billing/useBillingPreviewInvoice';

import { useState } from 'react';

import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';

import { NavArrowRight } from 'iconoir-react';

import {
    rateRows,
    usageMeter,
} from 'src/components/admin/Billing/overview/priceSteps';
import { ThisMonthChart } from 'src/components/admin/Billing/overview/ThisMonthChart';
import { ThisMonthMeter } from 'src/components/admin/Billing/overview/ThisMonthMeter';
import { BillingCard } from 'src/components/admin/Billing/shared/BillingCard';
import {
    captionColor,
    captionSx,
    CardHeader,
    numericSx,
    ruleSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import {
    DisclosureRow,
    panelRowSx,
} from 'src/components/admin/Billing/shared/DisclosureRow';
import {
    formatCents,
    formatDay,
    formatGb,
    formatHours,
    formatMonthName,
    formatMonthToDate,
    formatNumber,
    nextMonthStart,
    utcToday,
} from 'src/components/admin/Billing/shared/format';
import {
    adjustmentDescription,
    lineItemKind,
    sumCents,
    USAGE_NAMES,
} from 'src/components/admin/Billing/shared/lineItems';
import { useUsageColors } from 'src/components/admin/Billing/shared/useUsageColors';
import AlertBox from 'src/components/shared/AlertBox';
import { useTaskUsageTasks } from 'src/hooks/billing/useTaskUsageTasks';

// Past either limit, the free trial starts. The task limit is task hours for
// two tasks running all month, which enabled tasks stand in for.
const FREE_TIER = { gb: 10, tasks: 2 };

function FreeTierMeters({ tenant, gb }: { tenant: string; gb: number }) {
    const colors = useUsageColors();
    const { tasks, loading, error } = useTaskUsageTasks(tenant);
    const enabled = tasks.filter(({ disabled }) => !disabled).length;

    return (
        <>
            <ThisMonthMeter
                name={USAGE_NAMES.data}
                color={colors.data}
                meter={{
                    steps: [],
                    percent: (gb / FREE_TIER.gb) * 100,
                    quantity: `${formatNumber(gb, 1)} of ${FREE_TIER.gb} GB`,
                    next: 'Free tier limit',
                }}
            />
            {loading || error ? null : (
                <ThisMonthMeter
                    name="Tasks"
                    color={colors.hours}
                    meter={{
                        steps: [],
                        percent: (enabled / FREE_TIER.tasks) * 100,
                        quantity: `${enabled} of ${FREE_TIER.tasks} tasks`,
                        next: 'Free tier limit',
                    }}
                />
            )}
        </>
    );
}

interface AdjustmentProps {
    label: string;
    cents: number;
    children: ReactNode;
}

function Adjustment({ label, cents, children }: AdjustmentProps) {
    return (
        <DisclosureRow
            insetRule
            summary={
                <Stack
                    direction="row"
                    sx={{
                        ...numericSx,
                        justifyContent: 'space-between',
                        columnGap: 2,
                        fontWeight: 500,
                    }}
                >
                    <span>{label}</span>
                    <span>{formatCents(cents)}</span>
                </Stack>
            }
        >
            {children}
        </DisclosureRow>
    );
}

function AdjustmentLines({ lineItems }: { lineItems: InvoiceLineItem[] }) {
    return (
        <>
            {lineItems.map((item, index) => (
                <Stack
                    key={index}
                    direction="row"
                    sx={{
                        ...panelRowSx,
                        ...numericSx,
                        justifyContent: 'space-between',
                        columnGap: 1.5,
                    }}
                >
                    <span>{adjustmentDescription(item)}</span>
                    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                        {formatCents(item.subtotal)}
                    </Box>
                </Stack>
            ))}
        </>
    );
}

interface ThisMonthProps {
    tenant: string;
    plan: BillingPlan;
    invoice: Invoice | undefined;
    monthToDate: ReturnType<typeof useBillingMonthToDate>;
    alertCents: number | null;
    onShowUsage: () => void;
}

function ThisMonth({
    tenant,
    plan,
    invoice,
    monthToDate,
    alertCents,
    onShowUsage,
}: ThisMonthProps) {
    const colors = useUsageColors();
    const [showRates, setShowRates] = useState(false);

    const today = utcToday();
    const month = formatMonthName(today);
    const lineItems: InvoiceLineItem[] = invoice?.lineItems ?? [];
    const subtotal = invoice?.subtotal ?? 0;
    const used: Record<UsageKind, number> = {
        data: invoice?.extra?.processed_data_gb ?? 0,
        hours: invoice?.extra?.task_usage_hours ?? 0,
    };

    if (plan.__typename === 'InternalPlan') {
        const notBilled: UsageMeter = {
            steps: [],
            quantity: 'Not billed',
            next: '',
        };

        return (
            <>
                <Stack spacing={0.5} sx={{ px: 3, pt: 2, pb: 1 }}>
                    <CardHeader
                        title={`Data processed in ${month}`}
                        caption={formatMonthToDate(today)}
                    />
                    <Hero>{formatGb(used.data)}</Hero>
                </Stack>

                <Box sx={{ px: 3, pt: 1 }}>
                    <ThisMonthMeter
                        name={USAGE_NAMES.data}
                        color={colors.data}
                        amount={formatGb(used.data)}
                        meter={notBilled}
                    />
                    <ThisMonthMeter
                        name={USAGE_NAMES.hours}
                        color={colors.hours}
                        amount={formatHours(used.hours)}
                        meter={notBilled}
                    />
                </Box>

                <Footer onShowUsage={onShowUsage} />
            </>
        );
    }

    const tiers: Record<UsageKind, typeof plan.dataTiers> = {
        data: plan.dataTiers,
        hours: plan.usageTiers,
    };
    const selfServe = plan.__typename === 'SelfServePlan' ? plan : null;
    const trialEnd = selfServe?.trial?.end;
    // Contracts show what's billed beyond their recurring fee.
    const recurringFee: number =
        plan.__typename === 'ContractPlan'
            ? (invoice?.extra?.recurring_fee ?? 0)
            : 0;

    const freeTierCents = sumCents(lineItems, 'freeTier');
    const trialCents = sumCents(lineItems, 'trial');
    const adjustments = lineItems.filter(
        ({ description }) => lineItemKind(description) === 'adjustment'
    );
    const credits = adjustments.filter(({ subtotal: cents }) => cents < 0);
    const charges = adjustments.filter(({ subtotal: cents }) => cents > 0);

    // The free tier has no rates to show until a trial starts.
    const hasRates = selfServe?.phase !== 'FREE';

    return (
        <>
            <Stack spacing={0.5} sx={{ px: 3, pt: 2, pb: 1 }}>
                <CardHeader
                    title={
                        plan.__typename === 'ContractPlan'
                            ? `Overage in ${month}`
                            : `Due for ${month}`
                    }
                    caption={`${formatMonthToDate(today)} · billed ${formatDay(nextMonthStart(today))}`}
                />
                {/* Credits can exceed this month's charges. */}
                <Hero>{formatCents(Math.max(0, subtotal - recurringFee))}</Hero>
            </Stack>

            <ThisMonthChart monthToDate={monthToDate} alertCents={alertCents} />

            <Box sx={{ px: 3, pt: 0.5 }}>
                {selfServe?.phase === 'FREE' ? (
                    <FreeTierMeters tenant={tenant} gb={used.data} />
                ) : (
                    (['data', 'hours'] as const).map((kind) => (
                        <ThisMonthMeter
                            key={kind}
                            name={USAGE_NAMES[kind]}
                            color={colors[kind]}
                            amount={formatCents(sumCents(lineItems, kind))}
                            meter={usageMeter(tiers[kind], used[kind], kind)}
                        />
                    ))
                )}
            </Box>

            {freeTierCents !== 0 ? (
                <Adjustment label="Free tier" cents={freeTierCents}>
                    <Typography
                        sx={{
                            ...panelRowSx,
                            fontSize: 13,
                            color: captionColor,
                        }}
                    >
                        The free tier covers up to 2 tasks and 10 GB a month.
                    </Typography>
                </Adjustment>
            ) : null}

            {trialCents !== 0 ? (
                <Adjustment label="Free trial" cents={trialCents}>
                    <Typography
                        sx={{
                            ...panelRowSx,
                            fontSize: 13,
                            color: captionColor,
                        }}
                    >
                        {trialEnd
                            ? `Your trial covers all usage until ${formatDay(trialEnd)}.`
                            : 'Your trial covers all usage.'}
                    </Typography>
                </Adjustment>
            ) : null}

            {credits.length > 0 ? (
                <Adjustment
                    label="Billing credits"
                    cents={credits.reduce(
                        (sum, item) => sum + item.subtotal,
                        0
                    )}
                >
                    <AdjustmentLines lineItems={credits} />
                </Adjustment>
            ) : null}

            {charges.length > 0 ? (
                <Adjustment
                    label="Other charges"
                    cents={charges.reduce(
                        (sum, item) => sum + item.subtotal,
                        0
                    )}
                >
                    <AdjustmentLines lineItems={charges} />
                </Adjustment>
            ) : null}

            {hasRates && showRates ? (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(260px, 1fr))',
                        columnGap: 5,
                        rowGap: 1,
                        px: 3,
                        pt: 1.5,
                        pb: 2,
                        ...ruleSx,
                    }}
                >
                    {(['data', 'hours'] as const).map((kind) => (
                        <Stack key={kind} sx={{ fontSize: 13 }}>
                            <Typography
                                sx={{
                                    ...captionSx,
                                    fontSize: 12,
                                    pt: 0.5,
                                    pb: 0.75,
                                }}
                            >
                                {USAGE_NAMES[kind]}
                                {selfServe?.phase === 'TRIAL'
                                    ? ' (after your trial)'
                                    : ''}
                            </Typography>

                            {rateRows(tiers[kind], used[kind], kind).map(
                                ({ range, rate, current }) => (
                                    <Stack
                                        key={range}
                                        direction="row"
                                        sx={{
                                            ...numericSx,
                                            justifyContent: 'space-between',
                                            columnGap: 2,
                                            py: 0.625,
                                            color: current
                                                ? 'text.primary'
                                                : captionColor,
                                            fontWeight: current ? 500 : 400,
                                        }}
                                    >
                                        <span>{range}</span>
                                        <span>{rate}</span>
                                    </Stack>
                                )
                            )}
                        </Stack>
                    ))}
                </Box>
            ) : null}

            <Footer
                onShowUsage={onShowUsage}
                rates={
                    hasRates ? (
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setShowRates(!showRates)}
                        >
                            {showRates ? 'Hide rates' : 'Rates'}
                        </Button>
                    ) : null
                }
            />
        </>
    );
}

function Hero({ children }: { children: ReactNode }) {
    return (
        <Typography
            sx={{
                ...numericSx,
                fontSize: 34,
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
            }}
        >
            {children}
        </Typography>
    );
}

interface FooterProps {
    onShowUsage: () => void;
    rates?: ReactNode;
}

function Footer({ onShowUsage, rates }: FooterProps) {
    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                columnGap: 1.5,
                px: 2,
                pt: 1.25,
                pb: 1.5,
                ...ruleSx,
            }}
        >
            {rates ?? <span />}
            <Button
                variant="text"
                size="small"
                endIcon={<NavArrowRight />}
                onClick={onShowUsage}
            >
                Usage by task
            </Button>
        </Stack>
    );
}

interface Props {
    tenant: string;
    plan: ReturnType<typeof useBillingPlan>;
    preview: ReturnType<typeof useBillingPreviewInvoice>;
    monthToDate: ReturnType<typeof useBillingMonthToDate>;
    // The spend alert's amount, or null while it's off.
    alertCents: number | null;
    onShowUsage: () => void;
}

export function ThisMonthCard({
    tenant,
    plan,
    preview,
    monthToDate,
    alertCents,
    onShowUsage,
}: Props) {
    if (plan.error || preview.error) {
        return (
            <BillingCard label="This month">
                <Box sx={{ px: 3, py: 2 }}>
                    <AlertBox short severity="error">
                        There was an error loading this month&apos;s usage.
                        Please try again later.
                    </AlertBox>
                </Box>
            </BillingCard>
        );
    }

    return (
        <BillingCard label="This month">
            {plan.plan && !preview.isLoading ? (
                <ThisMonth
                    tenant={tenant}
                    plan={plan.plan}
                    invoice={preview.invoice}
                    monthToDate={monthToDate}
                    alertCents={alertCents}
                    onShowUsage={onShowUsage}
                />
            ) : (
                <Stack spacing={1} sx={{ px: 3, py: 2 }}>
                    <Skeleton width={160} />
                    <Skeleton width={140} height={44} />
                    <Skeleton variant="rounded" height={120} />
                    <Skeleton />
                    <Skeleton />
                </Stack>
            )}
        </BillingCard>
    );
}
