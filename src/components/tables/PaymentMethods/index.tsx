import type { TableState } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Table, TableContainer, Typography } from '@mui/material';

import { useIntl } from 'react-intl';
import { useQuery } from 'urql';

import { PAYMENT_METHODS_QUERY } from 'src/api/billing';
import AlertBox from 'src/components/shared/AlertBox';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import Rows from 'src/components/tables/PaymentMethods/Rows';
import { columns } from 'src/components/tables/PaymentMethods/shared';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';
import { TableStatuses } from 'src/types';

const PaymentMethodsTable = () => {
    const intl = useIntl();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [{ data, error, fetching }] = useQuery({
        pause: !selectedTenant,
        query: PAYMENT_METHODS_QUERY,
        variables: { name: selectedTenant },
    });

    const setPaymentMethodExists = useBillingStore(
        (state) => state.setPaymentMethodExists
    );

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const loading = tableState.status === TableStatuses.LOADING;

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

    useEffect(() => {
        if (!selectedTenant || fetching) {
            setTableState({ status: TableStatuses.LOADING });
        } else if (
            data?.tenant?.billing.paymentMethods &&
            data.tenant.billing.paymentMethods.length > 0
        ) {
            setPaymentMethodExists(data.tenant.billing.paymentMethods);
            setTableState({
                status: TableStatuses.DATA_FETCHED,
            });
        } else {
            setPaymentMethodExists(data?.tenant?.billing.paymentMethods);
            setTableState({
                status: TableStatuses.NO_EXISTING_DATA,
            });
        }
    }, [
        fetching,
        selectedTenant,
        data?.tenant?.billing.paymentMethods,
        setPaymentMethodExists,
    ]);

    if (serverErrored) {
        return (
            <AlertBox severity="error" short>
                <Typography component="div">
                    {intl.formatMessage({
                        id: 'admin.billing.error.paymentMethodsError',
                    })}
                </Typography>
            </AlertBox>
        );
    }

    return (
        <TableContainer>
            <Table
                aria-label="simple table"
                size="small"
                sx={{ minWidth: 650 }}
            >
                <EntityTableHeader columns={columns} />

                <EntityTableBody
                    columns={columns}
                    loading={loading}
                    noExistingDataContentIds={{
                        disableDoclink: true,
                        header: 'admin.billing.paymentMethods.table.emptyTableDefault.header',
                        message:
                            'admin.billing.paymentMethods.table.emptyTableDefault.message',
                    }}
                    rows={
                        !loading &&
                        data?.tenant?.billing.paymentMethods &&
                        data.tenant.billing.paymentMethods.length > 0 ? (
                            <Rows
                                data={data.tenant.billing.paymentMethods}
                                primaryMethodId={
                                    data.tenant.billing?.primaryPaymentMethod
                                        ?.id
                                }
                            />
                        ) : null
                    }
                    tableState={tableState}
                />
            </Table>
        </TableContainer>
    );
};

export default PaymentMethodsTable;
