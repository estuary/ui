import type { BillingPaymentMethodFieldsFragment } from 'src/gql-types/graphql';

import { Button, TableCell, TableRow } from '@mui/material';

import { Check } from 'iconoir-react';
import { useSemanticLeaf } from 'react-semantic-tree';

import AmexLogo from 'src/images/payment-methods/amex.png';
import DiscoverLogo from 'src/images/payment-methods/discover.png';
import MastercardLogo from 'src/images/payment-methods/mastercard.png';
import VisaLogo from 'src/images/payment-methods/visa.png';

const cardLogos: Record<string, string> = {
    amex: AmexLogo,
    discover: DiscoverLogo,
    visa: VisaLogo,
    mastercard: MastercardLogo,
};

export interface PaymentMethodProps {
    canEdit: boolean;
    busy: boolean;
    pendingAction?: 'delete' | 'primary';
    method: BillingPaymentMethodFieldsFragment;
    onDelete(): void;
    onPrimary(): void;
    primary: boolean;
}

export const PaymentMethod = ({
    canEdit,
    busy,
    pendingAction,
    method: { type, billingDetails, card, usBankAccount },
    onDelete,
    onPrimary,
    primary,
}: PaymentMethodProps) => {
    const { ref: semanticDeletePaymentMethodRef } =
        useSemanticLeaf<HTMLButtonElement>('Delete Payment Method');
    const { ref: semanticMakePrimaryRef } =
        useSemanticLeaf<HTMLButtonElement>('Make Primary');

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>
                {type === 'card' && card ? (
                    cardLogos[card.brand ?? 'unknown'] ? (
                        <img
                            style={{ height: 35 }}
                            src={cardLogos[card.brand ?? 'unknown']}
                            alt={`${card.brand} card logo`}
                        />
                    ) : (
                        card.brand
                    )
                ) : (
                    (usBankAccount?.bankName ?? type.replaceAll('_', ' '))
                )}
            </TableCell>
            <TableCell>{billingDetails.name}</TableCell>
            <TableCell>
                {type === 'card' && card
                    ? card.last4
                    : (usBankAccount?.last4 ?? '—')}
            </TableCell>
            <TableCell>
                {type === 'card' && card ? (
                    <>
                        Expires {card.expMonth}/{card.expYear}
                    </>
                ) : (
                    '—'
                )}
            </TableCell>
            <TableCell>{primary ? <Check /> : ''}</TableCell>
            <TableCell>
                {canEdit ? (
                    <>
                        <Button
                            ref={semanticDeletePaymentMethodRef}
                            size="small"
                            variant="text"
                            onClick={onDelete}
                            disabled={busy}
                            loading={pendingAction === 'delete'}
                            loadingPosition="start"
                        >
                            Delete
                        </Button>
                        {!primary ? (
                            <Button
                                ref={semanticMakePrimaryRef}
                                size="small"
                                variant="text"
                                onClick={onPrimary}
                                disabled={busy}
                                loading={pendingAction === 'primary'}
                                loadingPosition="start"
                            >
                                Make Primary
                            </Button>
                        ) : null}
                    </>
                ) : null}
            </TableCell>
        </TableRow>
    );
};
