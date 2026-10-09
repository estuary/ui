import { useState } from 'react';

import { Button, Chip, Skeleton, Stack, Typography } from '@mui/material';

import { CheckCircle, EditPencil, Plus } from 'iconoir-react';

import { BillingContactDialog } from 'src/components/admin/Billing/BillingContactDialog';
import { BillingEditLock } from 'src/components/admin/Billing/BillingEditLock';
import { TaxExemptionNote } from 'src/components/admin/Billing/TaxExemptionNote';
import CardWrapper from 'src/components/shared/CardWrapper';
import { useBillingContact } from 'src/hooks/billing/useBillingContact';
import { useBillingPaymentMethods } from 'src/hooks/billing/useBillingPaymentMethods';
import { useTenantStore } from 'src/stores/Tenant';
import {
    formatAddress,
    getContactStatus,
    getMissingContactFields,
} from 'src/utils/billing-contact-utils';

// The page remounts this section when the selected tenant changes.
export function BillingContactSection({ canEdit }: { canEdit: boolean }) {
    const tenant = useTenantStore((state) => state.selectedTenant);
    const { contact, isLoading, error } = useBillingContact(tenant);
    const { billing } = useBillingPaymentMethods(tenant);

    const [editing, setEditing] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    // The page shows one error for the contact and payment sections.
    if (error) {
        throw error;
    }

    const status = getContactStatus(contact);
    const missing = getMissingContactFields(contact).join(', ');
    const address = formatAddress(contact?.address);

    const action = isLoading ? null : !canEdit ? (
        <BillingEditLock tenant={tenant} />
    ) : status === 'complete' ? (
        <Button
            variant="text"
            startIcon={<EditPencil style={{ fontSize: 15 }} />}
            onClick={() => setEditing(true)}
        >
            Edit
        </Button>
    ) : status === 'incomplete' ? (
        <Button variant="contained" onClick={() => setEditing(true)}>
            Finish
        </Button>
    ) : (
        <Button
            variant="contained"
            startIcon={<Plus style={{ fontSize: 15 }} />}
            onClick={() => setEditing(true)}
            sx={{ whiteSpace: 'nowrap' }}
        >
            Add billing contact
        </Button>
    );

    return (
        <Stack spacing={1.5}>
            <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', minHeight: 26 }}
            >
                <Typography sx={{ fontSize: 18, fontWeight: 400 }}>
                    Billing contact
                </Typography>
                {justSaved ? (
                    <Stack
                        component="output"
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: 'center', color: 'success.main' }}
                    >
                        <CheckCircle style={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: 'inherit' }}>
                            Saved
                        </Typography>
                    </Stack>
                ) : null}
            </Stack>

            <CardWrapper
                disableMinWidth
                sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    columnGap: 2,
                    minHeight: 56,
                    py: 1.25,
                    pl: 2,
                    pr: 1.5,
                }}
            >
                <Stack
                    direction="row"
                    useFlexGap
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        columnGap: 1.25,
                        rowGap: 0.5,
                    }}
                >
                    {isLoading ? (
                        <Skeleton sx={{ width: '60%' }} />
                    ) : status === 'missing' ? (
                        <Typography sx={{ color: 'text.secondary' }}>
                            {canEdit
                                ? 'Add the legal name and address to show on invoices and receipts.'
                                : `Someone who can edit billing for ${tenant} can add the name and address shown on invoices.`}
                        </Typography>
                    ) : (
                        <>
                            {contact?.name ? (
                                <Typography
                                    sx={{
                                        fontWeight: 500,
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {contact.name}
                                </Typography>
                            ) : null}
                            {contact?.email ? (
                                <Typography
                                    sx={{
                                        color: 'text.secondary',
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {contact.email}
                                </Typography>
                            ) : null}
                            {address ? (
                                <Typography sx={{ color: 'text.secondary' }}>
                                    {address}
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
                        </>
                    )}
                </Stack>

                {action}
            </CardWrapper>

            <TaxExemptionNote />

            {canEdit ? (
                <BillingContactDialog
                    open={editing}
                    tenant={tenant}
                    contact={contact}
                    mode="edit"
                    hasPaymentMethods={Boolean(billing?.paymentMethods.length)}
                    onClose={() => setEditing(false)}
                    onSaved={() => {
                        setEditing(false);
                        setJustSaved(true);
                        setTimeout(() => setJustSaved(false), 4000);
                    }}
                />
            ) : null}
        </Stack>
    );
}
