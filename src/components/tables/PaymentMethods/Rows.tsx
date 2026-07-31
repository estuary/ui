import type { PaymentMethod } from 'src/gql-types/graphql';

import { Button, TableCell, TableRow } from '@mui/material';

import { Check } from 'iconoir-react';

import { cardLogos } from 'src/components/tables/PaymentMethods/shared';

export interface PaymentMethodRowProps extends PaymentMethod {
    isPrimaryMethod: boolean;
    onDelete(): void;
    onPrimary(): void;
}

const Row = ({
    billingDetails,
    card,
    isPrimaryMethod,
    onDelete,
    onPrimary,
    type: methodType,
    usBankAccount,
}: PaymentMethodRowProps) => {
    const cardBrandLogo = card?.brand ? cardLogos[card.brand] : undefined;

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>
                {methodType === 'card' ? (
                    cardBrandLogo ? (
                        <img
                            style={{ height: 35 }}
                            src={cardBrandLogo}
                            alt={`${card?.brand} card logo`}
                        />
                    ) : (
                        card?.brand
                    )
                ) : (
                    usBankAccount?.bankName
                )}
            </TableCell>

            <TableCell>{billingDetails.name}</TableCell>

            <TableCell>
                {methodType === 'card' ? card?.last4 : usBankAccount?.last4}
            </TableCell>

            <TableCell>
                {methodType === 'card' ? (
                    <>
                        Expires {card?.expMonth}/{card?.expYear}
                    </>
                ) : (
                    usBankAccount?.accountHolderType
                )}
            </TableCell>

            <TableCell>{isPrimaryMethod ? <Check /> : ''}</TableCell>

            <TableCell>
                <Button size="small" variant="text" onClick={onDelete}>
                    Delete
                </Button>

                {!isPrimaryMethod ? (
                    <Button size="small" variant="text" onClick={onPrimary}>
                        Make Primary
                    </Button>
                ) : null}
            </TableCell>
        </TableRow>
    );
};

export default Row;
