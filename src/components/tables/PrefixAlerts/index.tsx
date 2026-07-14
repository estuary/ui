import type { SubscriptionMetadataDictionary } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { Schema, TableState } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Stack, Table, TableContainer } from '@mui/material';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';
import { useQuery } from 'urql';

import { AlertConfigQuery } from 'src/api/alerts';
import AlertGenerateButton from 'src/components/admin/Settings/PrefixAlerts/GenerateButton';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import Rows from 'src/components/tables/PrefixAlerts/Rows';
import {
    columns,
    TABLE_HEADER_HEIGHT,
    TABLE_ROW_HEIGHT,
} from 'src/components/tables/PrefixAlerts/shared';
import TableFilter from 'src/components/tables/PrefixAlerts/TableFilter';
import { useGetAlertSubscriptions } from 'src/context/AlertSubscriptions';
import { useTenantStore } from 'src/stores/Tenant';
import { TableStatuses } from 'src/types';
import { bundleSubscriptionsByPrefix } from 'src/utils/notification-utils';

function PrefixAlertTable() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [{ data, error, fetching }] = useGetAlertSubscriptions();
    const [alertConfigResponse] = useQuery({
        pause: selectedTenant.length === 0,
        query: AlertConfigQuery,
    });

    const setInitializationError = useAlertSubscriptionsStore(
        (state) => state.setInitializationError
    );
    const setSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.setSubscriptionMetadata
    );

    const initializeGlobalPrefixSettings = useAlertSubscriptionsStore(
        (state) => state.initializeGlobalPrefixSettings
    );

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const processedData: SubscriptionMetadataDictionary = useMemo(() => {
        if (!data?.alertSubscriptions) {
            return {};
        }

        const evaluatedData = searchQuery
            ? data.alertSubscriptions.filter(
                  ({ catalogPrefix, email }) =>
                      catalogPrefix.includes(searchQuery) ||
                      email.includes(searchQuery)
              )
            : data.alertSubscriptions;

        return bundleSubscriptionsByPrefix(evaluatedData);
    }, [data?.alertSubscriptions, searchQuery]);

    const processedDataExists = useMemo(
        () => Object.keys(processedData).length > 0,
        [processedData]
    );

    // TODO: Create a hook that encapsulates this logic since it is used for the
    //   field selection table as well.
    const displayLoadingState = useRef(
        debounce(() => setTableState({ status: TableStatuses.LOADING }), 750)
    );

    useUnmount(() => {
        displayLoadingState.current?.cancel();
    });

    useEffect(() => {
        if (!fetching && !alertConfigResponse.fetching) {
            setInitializationError(error);
            setSubscriptionMetadata(data?.alertSubscriptions ?? []);

            const config: { prefix: string; config: Schema }[] =
                alertConfigResponse?.data &&
                alertConfigResponse.data.alertConfigs.edges.length > 0
                    ? alertConfigResponse.data.alertConfigs.edges.map(
                          ({ node }) => ({
                              prefix: node.catalogPrefixOrName,
                              config: node.effective.config,
                          })
                      )
                    : [];

            initializeGlobalPrefixSettings(config);
        }
    }, [
        alertConfigResponse?.data,
        alertConfigResponse.fetching,
        data?.alertSubscriptions,
        error,
        fetching,
        initializeGlobalPrefixSettings,
        setInitializationError,
        setSubscriptionMetadata,
    ]);

    useEffect(() => {
        if (fetching || alertConfigResponse.fetching) {
            setTableState({ status: TableStatuses.LOADING });
        } else if (processedDataExists) {
            displayLoadingState.current?.cancel();

            setTableState({
                status: TableStatuses.DATA_FETCHED,
            });
        } else {
            displayLoadingState.current?.cancel();

            setTableState({
                status: searchQuery
                    ? TableStatuses.UNMATCHED_FILTER
                    : TableStatuses.NO_EXISTING_DATA,
            });
        }
    }, [
        alertConfigResponse.fetching,
        processedDataExists,
        fetching,
        searchQuery,
    ]);

    const loading = tableState.status === TableStatuses.LOADING;

    return (
        <Box style={{ margin: '0 16px' }}>
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    my: 2,
                }}
            >
                <AlertGenerateButton />

                <TableFilter
                    disabled={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </Stack>

            <TableContainer
                style={{
                    maxHeight:
                        10 * TABLE_ROW_HEIGHT +
                        TABLE_HEADER_HEIGHT +
                        TABLE_ROW_HEIGHT / 2.5,
                }}
            >
                <Table
                    size="small"
                    stickyHeader
                    sx={{ borderCollapse: 'separate' }}
                >
                    <EntityTableHeader columns={columns} selectData={true} />

                    <EntityTableBody
                        columns={columns}
                        loading={loading}
                        noExistingDataContentIds={{
                            header: 'alerts.config.table.noContent.header',
                            message: 'alerts.config.table.noContent.message',
                            disableDoclink: true,
                        }}
                        rows={
                            processedDataExists ? (
                                <Rows data={Object.values(processedData)} />
                            ) : null
                        }
                        tableState={tableState}
                    />
                </Table>
            </TableContainer>
        </Box>
    );
}

export default PrefixAlertTable;
