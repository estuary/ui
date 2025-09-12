import type { AlertSummaryProps } from 'src/components/home/dashboard/AlertingOverview/types';
import type { ChipDisplay } from 'src/components/shared/ChipList/types';

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import ChipList from 'src/components/shared/ChipList';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import TableLoadingRows from 'src/components/tables/Loading';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { getTableComponents } from 'src/utils/table-utils';

export default function AlertSummary({
    entityType,
    fetching,
    filteredDataArray,
}: AlertSummaryProps) {
    const intl = useIntl();

    const { tbodyComponent, tdComponent, trComponent, theaderComponent } =
        getTableComponents(false);

    const getAlertTypeContent = useAlertTypeContent();

    const { generatePath } = useDetailsNavigator(
        entityType === 'capture'
            ? authenticatedRoutes.captures.details.alerts.fullPath
            : entityType === 'materialization'
              ? authenticatedRoutes.materializations.details.alerts.fullPath
              : authenticatedRoutes.collections.details.alerts.fullPath
    );

    return (
        <TableContainer component={Box}>
            <Table
                size="small"
                sx={{
                    minWidth: 300,
                    borderCollapse: 'separate',
                }}
                aria-label={intl.formatMessage({
                    id: 'alerts.overview.label',
                })}
            >
                <TableHead component={theaderComponent}>
                    <TableRow>
                        <TableCell
                            sx={{
                                minWidth: 250,
                                maxWidth: 'min-content',
                            }}
                        >
                            {intl.formatMessage({
                                id: 'entityName.label',
                            })}
                        </TableCell>
                        <TableCell>
                            {intl.formatMessage({
                                id: 'alerts.overview.recentAlerts',
                            })}
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody component={tbodyComponent}>
                    {fetching ? (
                        <TableLoadingRows
                            columnKeys={['1', '2']}
                            enableDivRendering
                        />
                    ) : (
                        filteredDataArray.map(([catalogName, datum], index) => {
                            return (
                                <TableRow
                                    component={trComponent}
                                    key={`alert-summary-${datum[0].catalogName}-${index}`}
                                >
                                    <EntityNameLink
                                        name={catalogName}
                                        showEntityStatus={false}
                                        detailsLink={generatePath({
                                            catalog_name: catalogName,
                                        })}
                                        entityStatusTypes={[entityType]}
                                    />

                                    <TableCell component={tdComponent}>
                                        <ChipList
                                            forceTooltip
                                            stripPath={false}
                                            values={datum.map(
                                                (alertData): ChipDisplay => {
                                                    const {
                                                        humanReadable,
                                                        firedAtReadable:
                                                            readableTime,
                                                    } =
                                                        getAlertTypeContent(
                                                            alertData
                                                        );

                                                    return {
                                                        display: humanReadable,
                                                        title: readableTime,
                                                    };
                                                }
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
