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
    onDelete(): void;
    onPrimary(): void;
    primary: boolean;
    id: string;
    type: 'card' | 'us_bank_account';
    billing_details: {
        address: {
            city: string;
            country: string;
            line1: string;
            line2: string;
            postal_code: string;
            state: string;
        };
        email: string;
        name: string;
    };
    card: {
        brand:
            | 'amex'
            | 'diners'
            | 'discover'
            | 'eftpos_au'
            | 'jcb'
            | 'mastercard'
            | 'unionpay'
            | 'visa'
            | 'unknown';
        country: string;
        exp_month: number;
        exp_year: number;
        last4: number;
    };
    us_bank_account: {
        account_holder_type: 'individual' | 'company';
        account_type: 'checking' | 'savings';
        bank_name: string;
        last4: number;
    };
}

export const PaymentMethod = ({
    type,
    onDelete,
    onPrimary,
    billing_details,
    card,
    us_bank_account,
    primary,
}: PaymentMethodProps) => {
    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>
                {type === 'card' ? (
                    cardLogos[card.brand] ? (
                        <img
                            style={{ height: 35 }}
                            src={cardLogos[card.brand]}
                            alt={`${card.brand} card logo`}
                        />
                    ) : (
                        card.brand
                    )
                ) : (
                    us_bank_account.bank_name
                )}
            </TableCell>
            <TableCell>{billing_details.name}</TableCell>
            <TableCell>
                {type === 'card' ? card.last4 : us_bank_account.last4}
            </TableCell>
            <TableCell>
                {type === 'card' ? (
                    <>
                        Expires {card.exp_month}/{card.exp_year}
                    </>
                ) : (
                    us_bank_account.account_type
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
