import type { BillingPaymentMethodFieldsFragment } from 'src/gql-types/graphql';

import { Button, TableCell, TableRow } from '@mui/material';

import { Check } from 'iconoir-react';

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
    method: BillingPaymentMethodFieldsFragment;
    onDelete(): void;
    onPrimary(): void;
    primary: boolean;
}

export const PaymentMethod = ({
    method: { type, billingDetails, card, usBankAccount },
    onDelete,
    onPrimary,
    primary,
}: PaymentMethodProps) => {
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
                <Button size="small" variant="text" onClick={onDelete}>
                    Delete
                </Button>
                {!primary ? (
                    <Button size="small" variant="text" onClick={onPrimary}>
                        Make Primary
                    </Button>
                ) : null}
            </TableCell>
        </TableRow>
    );
};
