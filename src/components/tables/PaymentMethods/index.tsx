import { useEffect, useMemo } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useQuery } from 'urql';

import {
    deleteTenantPaymentMethod,
    PAYMENT_METHODS_QUERY,
    setTenantPrimaryPaymentMethod,
} from 'src/api/billing';
import AlertBox from 'src/components/shared/AlertBox';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import TableLoadingRows from 'src/components/tables/Loading';
import Row from 'src/components/tables/PaymentMethods/Rows';
import { columns } from 'src/components/tables/PaymentMethods/shared';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';
import { getColumnKeyList } from 'src/utils/table-utils';

const PaymentMethodsTable = () => {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [{ data, error, fetching }] = useQuery({
        pause: !selectedTenant,
        query: PAYMENT_METHODS_QUERY,
        variables: { name: selectedTenant },
    });

    const setPaymentMethodExists = useBillingStore(
        (state) => state.setPaymentMethodExists
    );

    useEffect(() => {
        if (!fetching) {
            setPaymentMethodExists(data?.tenant?.billing.paymentMethods);
        }
    }, [
        setPaymentMethodExists,
        data?.tenant?.billing.paymentMethods,
        fetching,
    ]);

    // TODO (optimization): Remove this temporary, hacky means of detecting when the payment methods service errs
    //   when proper error handling is in place.
    const serverErrored = useMemo(
        () => !fetching && typeof error !== 'undefined',
        [error, fetching]
    );

    useEffect(() => {
        if (serverErrored) {
            logRocketEvent(CustomEvents.ERROR_BOUNDARY_PAYMENT_METHODS);
        }
    }, [serverErrored]);

    return serverErrored ? (
        <AlertBox short severity="error">
            <Typography component="div">
                <FormattedMessage id="admin.billing.error.paymentMethodsError" />
            </Typography>
        </AlertBox>
    ) : (
        <TableContainer>
            <Table
                aria-label="simple table"
                size="small"
                sx={{ minWidth: 650 }}
            >
                <EntityTableHeader columns={columns} />

                <TableBody>
                    {!selectedTenant || fetching ? (
                        <TableLoadingRows
                            columnKeys={getColumnKeyList(columns)}
                        />
                    ) : data?.tenant?.billing.paymentMethods &&
                      data.tenant.billing.paymentMethods.length > 0 ? (
                        data.tenant.billing.paymentMethods.map((method) => {
                            const primaryMethodId =
                                data.tenant?.billing?.primaryPaymentMethod?.id;

                            return (
                                <Row
                                    {...method}
                                    key={method.id}
                                    isPrimaryMethod={
                                        method.id === primaryMethodId
                                    }
                                    onDelete={async () => {
                                        await deleteTenantPaymentMethod(
                                            selectedTenant,
                                            method.id
                                        );
                                    }}
                                    onPrimary={async () => {
                                        await setTenantPrimaryPaymentMethod(
                                            selectedTenant,
                                            method.id
                                        );
                                    }}
                                />
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <Typography sx={{ textAlign: 'center' }}>
                                    <FormattedMessage id="admin.billing.paymentMethods.table.emptyTableDefault.message" />
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PaymentMethodsTable;
