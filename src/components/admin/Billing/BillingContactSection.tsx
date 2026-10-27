import { useState } from 'react';

import {
    Button,
    Chip,
    Divider,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';

import { BillingContactDialog } from 'src/components/admin/Billing/BillingContactDialog';
import { TaxExemptionNote } from 'src/components/admin/Billing/TaxExemptionNote';
import CardWrapper from 'src/components/shared/CardWrapper';
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

    if (error) {
        throw error;
    }

    const status = getContactStatus(contact);
    const missing = getMissingContactFields(contact).join(', ');
    const address = formatAddress(contact?.address);

    const action =
        isLoading || !canEdit ? null : (
            <Button
                variant={status === 'complete' ? 'text' : 'contained'}
                onClick={() => setEditing(true)}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {actionLabels[status]}
            </Button>
        );

    return (
        <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 18, fontWeight: 400 }}>
                Billing contact
            </Typography>

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
                    divider={<Divider orientation="vertical" flexItem />}
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
                        // An array, so the Stack places a divider between the parts that are present.
                        [
                            contact?.name ? (
                                <Typography
                                    key="name"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: 16,
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {contact.name}
                                </Typography>
                            ) : null,
                            contact?.emails[0] ? (
                                <Typography
                                    key="email"
                                    sx={{ overflowWrap: 'anywhere' }}
                                >
                                    {contact.emails[0]}
                                </Typography>
                            ) : null,
                            address ? (
                                <Typography
                                    key="address"
                                    sx={{ color: 'text.disabled' }}
                                >
                                    {address}
                                </Typography>
                            ) : null,
                            status === 'incomplete' ? (
                                <Chip
                                    key="missing"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    label={`Missing ${missing}`}
                                />
                            ) : null,
                        ]
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
                    onClose={() => setEditing(false)}
                    onSaved={() => setEditing(false)}
                />
            ) : null}
        </Stack>
    );
}
