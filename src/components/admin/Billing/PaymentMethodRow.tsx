import { Box, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';

import { Star, StarSolid, Trash } from 'iconoir-react';

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
        <TableRow
            sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover .row-hover-action': { opacity: 1 },
                '& .row-hover-action:focus-visible': { opacity: 1 },
            }}
        >
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
                        {card.exp_month}/{card.exp_year}
                    </>
                ) : (
                    us_bank_account.account_type
                )}
            </TableCell>
            <TableCell>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                    }}
                >
                    <Tooltip title={primary ? 'Primary' : 'Make primary'}>
                        {primary ? (
                            <IconButton
                                disableRipple
                                size="small"
                                aria-label="Primary payment method"
                                sx={{
                                    color: 'warning.main',
                                    cursor: 'default',
                                }}
                            >
                                <StarSolid />
                            </IconButton>
                        ) : (
                            <IconButton
                                className="row-hover-action"
                                size="small"
                                onClick={onPrimary}
                                aria-label="Make primary"
                                sx={{
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    color: 'text.secondary',
                                }}
                            >
                                <Star />
                            </IconButton>
                        )}
                    </Tooltip>

                    <Tooltip title="Delete">
                        <IconButton
                            className="row-hover-action"
                            size="small"
                            onClick={onDelete}
                            aria-label="Delete payment method"
                            sx={{
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                color: 'error.main',
                            }}
                        >
                            <Trash />
                        </IconButton>
                    </Tooltip>
                </Box>
            </TableCell>
        </TableRow>
    );
};
