import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PaymentMethods/types';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { Check } from 'iconoir-react';

import {
    deleteTenantPaymentMethod,
    setTenantPrimaryPaymentMethod,
} from 'src/api/billing';
import { cardLogos } from 'src/components/tables/PaymentMethods/shared';
import { useTenantStore } from 'src/stores/Tenant';

const Row = ({
    billingDetails,
    card,
    isPrimaryMethod,
    onDelete,
    onPrimary,
    type: methodType,
    usBankAccount,
}: RowProps) => {
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
                    <Typography>
                        Expires {card?.expMonth}/{card?.expYear}
                    </Typography>
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

function Rows({ data, primaryMethodId }: RowsProps) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    return (
        <>
            {data.map((datum) => (
                <Row
                    {...datum}
                    key={datum.id}
                    isPrimaryMethod={datum.id === primaryMethodId}
                    onDelete={async () => {
                        await deleteTenantPaymentMethod(
                            selectedTenant,
                            datum.id
                        );
                    }}
                    onPrimary={async () => {
                        await setTenantPrimaryPaymentMethod(
                            selectedTenant,
                            datum.id
                        );
                    }}
                />
            ))}
        </>
    );
}

export default Rows;
