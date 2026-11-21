import { useState } from 'react';

import { Button, Chip, Skeleton, Stack, Typography } from '@mui/material';

import { BillingContactDialog } from 'src/components/admin/Billing/BillingContactDialog';
import { PaymentRow } from 'src/components/admin/Billing/overview/PaymentRow';
import {
    captionColor,
    captionSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import { TaxExemptionNote } from 'src/components/admin/Billing/TaxExemptionNote';
import AlertBox from 'src/components/shared/AlertBox';
import { useBillingContact } from 'src/hooks/billing/useBillingContact';
import { useTenantStore } from 'src/stores/Tenant';
import {
    formatAddress,
    getContactStatus,
    getMissingContactFields,
} from 'src/utils/billing-contact-utils';

const actionLabels = {
    complete: 'Edit',
    incomplete: 'Finish',
    missing: 'Add billing contact',
};

// The page remounts this section when the selected tenant changes.
export function BillingContactSection({ canEdit }: { canEdit: boolean }) {
    const tenant = useTenantStore((state) => state.selectedTenant);
    const { contact, isLoading, error } = useBillingContact(tenant);

    const [editing, setEditing] = useState(false);

    const status = getContactStatus(contact);
    const missing = getMissingContactFields(contact).join(', ');
    const address = formatAddress(contact?.address);
    const email = contact?.emails[0];

    const action =
        isLoading || error || !canEdit ? null : (
            <Button
                variant={status === 'complete' ? 'text' : 'contained'}
                size="small"
                onClick={() => setEditing(true)}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {actionLabels[status]}
            </Button>
        );

    return (
        <>
            <PaymentRow caption="Billing contact" action={action}>
                {error ? (
                    <AlertBox short severity="error">
                        There was an error loading your billing contact. Please
                        try again later.
                    </AlertBox>
                ) : isLoading ? (
                    <Skeleton width={260} />
                ) : status === 'missing' ? (
                    <Typography sx={{ color: captionColor }}>
                        {canEdit
                            ? 'Add the legal name and address to show on invoices and receipts.'
                            : `Someone who can edit billing for ${tenant} can add the name and address shown on invoices.`}
                    </Typography>
                ) : (
                    <>
                        <Stack
                            direction="row"
                            sx={{
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                columnGap: 0.75,
                                rowGap: 0.5,
                            }}
                        >
                            {contact?.name ? (
                                <Typography
                                    component="span"
                                    sx={{ overflowWrap: 'anywhere' }}
                                >
                                    {contact.name}
                                </Typography>
                            ) : null}
                            {contact?.name && email ? (
                                <Typography
                                    component="span"
                                    aria-hidden
                                    sx={{ color: captionColor }}
                                >
                                    &middot;
                                </Typography>
                            ) : null}
                            {email ? (
                                <Typography
                                    component="span"
                                    sx={{
                                        color: captionColor,
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {email}
                                </Typography>
                            ) : null}
                            {status === 'incomplete' ? (
                                <Chip
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    label={`Missing ${missing}`}
                                />
                            ) : null}
                        </Stack>

                        {address ? (
                            <Typography sx={captionSx}>{address}</Typography>
                        ) : null}
                    </>
                )}

                {error ? null : <TaxExemptionNote />}
            </PaymentRow>

            {canEdit ? (
                <BillingContactDialog
                    open={editing}
                    tenant={tenant}
                    contact={contact}
                    mode="edit"
                    onClose={() => setEditing(false)}
                    onSaved={() => setEditing(false)}
                />
            ) : null}
        </>
    );
}
