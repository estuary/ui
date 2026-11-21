import type {
    BillingPlan,
    Invoice,
    InvoiceLineItem,
} from 'src/api/gql/billing';
import type { InvoiceStatus } from 'src/components/admin/Billing/overview/invoiceRows';

import { Box, Chip, Link, Skeleton, Stack, Typography } from '@mui/material';

import { INVOICES_PAGE_SIZE } from 'src/api/gql/billing';
import {
    invoiceFootnote,
    invoiceStatus,
    invoiceSubtitle,
    invoiceTitle,
} from 'src/components/admin/Billing/overview/invoiceRows';
import { BillingCard } from 'src/components/admin/Billing/shared/BillingCard';
import {
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
    utcToday,
} from 'src/components/admin/Billing/shared/format';
import { invoiceLines } from 'src/components/admin/Billing/shared/lineItems';
import { PagerFooter } from 'src/components/admin/Billing/shared/PagerFooter';
import AlertBox from 'src/components/shared/AlertBox';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';

interface InvoiceRowProps {
    invoice: Invoice;
    status: InvoiceStatus | null;
    today: string;
    // Internal tenants' invoices price usage that isn't billed.
    unpriced: boolean;
}

function InvoiceRow({ invoice, status, today, unpriced }: InvoiceRowProps) {
    const lineItems: InvoiceLineItem[] = invoice.lineItems ?? [];
    const subtitle = invoiceSubtitle(invoice, today);
    const total = formatCents(unpriced ? 0 : invoice.subtotal);

    return (
        <DisclosureRow
            summary={
                <Box
                    sx={{
                        ...numericSx,
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto 100px',
                        columnGap: 2,
                        alignItems: 'center',
                    }}
                >
                    <Stack sx={{ minWidth: 0 }}>
                        <span>{invoiceTitle(invoice)}</span>
                        {subtitle ? (
                            <Typography
                                component="span"
                                sx={{ ...captionSx, fontSize: 12 }}
                            >
                                {subtitle}
                            </Typography>
                        ) : null}
                    </Stack>

                    <Box component="span" sx={{ textAlign: 'right' }}>
                        {total}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {status ? (
                            <Chip
                                size="small"
                                variant="outlined"
                                color={status.color}
                                label={status.label}
                            />
                        ) : null}
                    </Box>
                </Box>
            }
        >
            {invoiceLines(lineItems, unpriced).map((line, index) => (
                <Box
                    key={index}
                    sx={{
                        ...panelRowSx,
                        ...numericSx,
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) 140px 110px',
                        columnGap: 1.5,
                        alignItems: 'baseline',
                    }}
                >
                    <span>{line.description}</span>
                    <Box
                        component="span"
                        sx={{ ...captionSx, textAlign: 'right' }}
                    >
                        {line.quantity}
                    </Box>
                    <Box component="span" sx={{ textAlign: 'right' }}>
                        {formatCents(line.cents)}
                    </Box>
                </Box>
            ))}

            <Stack
                direction="row"
                sx={{
                    ...panelRowSx,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    columnGap: 2,
                    rowGap: 1,
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        ...captionSx,
                        ...numericSx,
                        fontSize: 12,
                        flexWrap: 'wrap',
                        columnGap: 2,
                        rowGap: 0.5,
                    }}
                >
                    <span>{invoiceFootnote(invoice)}</span>
                    {invoice.hostedInvoiceUrl ? (
                        <Link
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View invoice
                        </Link>
                    ) : null}
                    {invoice.invoicePdf ? (
                        <Link
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Download PDF
                        </Link>
                    ) : null}
                </Stack>

                <Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
                    {total}
                </Box>
            </Stack>
        </DisclosureRow>
    );
}

interface Props {
    tenant: string;
    plan: BillingPlan | undefined;
}

export function InvoicesCard({ tenant, plan }: Props) {
    const { invoices, page, hasNextPage, onPageChange, isLoading, error } =
        useBillingInvoices(tenant, INVOICES_PAGE_SIZE);

    const today = utcToday();
    const statusContext = {
        internal: plan?.__typename === 'InternalPlan',
        sendInvoice:
            plan?.__typename !== 'InternalPlan' &&
            plan?.collectionMethod === 'SEND_INVOICE',
    };
    const first = page * INVOICES_PAGE_SIZE + 1;

    return (
        <BillingCard label="Invoices">
            <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
                <CardHeader title="Invoices" />
            </Box>

            {error ? (
                <Box sx={{ ...ruleSx, px: 3, py: 2 }}>
                    <AlertBox short severity="error">
                        There was an error loading your invoices. Please try
                        again later.
                    </AlertBox>
                </Box>
            ) : isLoading ? (
                <Stack sx={{ ...ruleSx, px: 3, py: 1 }}>
                    {Array.from({ length: INVOICES_PAGE_SIZE }, (_, index) => (
                        <Skeleton key={index} height={40} />
                    ))}
                </Stack>
            ) : invoices.length === 0 ? (
                <Typography
                    sx={{ ...ruleSx, ...captionSx, px: 3, py: 2, fontSize: 14 }}
                >
                    No invoices yet.
                </Typography>
            ) : (
                invoices.map((invoice, index) => (
                    <InvoiceRow
                        // Manual invoices can share a final invoice's dates.
                        key={`${invoice.dateStart}-${invoice.invoiceType}-${index}`}
                        invoice={invoice}
                        status={invoiceStatus(invoice, statusContext)}
                        today={today}
                        unpriced={statusContext.internal}
                    />
                ))
            )}

            <Box sx={ruleSx}>
                <PagerFooter
                    // The API has no invoice count, so the range has no total.
                    range={
                        invoices.length > 0
                            ? `${first}–${first + invoices.length - 1}`
                            : null
                    }
                    label="Invoice pages"
                    pages={{
                        previous: {
                            label: 'Newer invoices',
                            disabled: page === 0 || isLoading,
                            onClick: () => onPageChange(page - 1),
                        },
                        // A page's cursor is only known once it loads.
                        next: {
                            label: 'Older invoices',
                            disabled: !hasNextPage || isLoading,
                            onClick: () => onPageChange(page + 1),
                        },
                    }}
                />
            </Box>
        </BillingCard>
    );
}
