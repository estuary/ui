import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/AlertHistory/types';

import { TableCell, TableRow } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AlertDetailsWrapper from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import { alertHistoryOptionalColumnIntlKeys } from 'src/components/tables/AlertHistory/shared';
import ActiveOrResolvedCells from 'src/components/tables/cells/activeResolved/Cells';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { isColumnVisible } from 'src/utils/table-utils';

function Row({ hideEntityName, hideResolvedAt, row }: RowProps) {
    const { catalogName, firedAt, resolvedAt, alertDetails } = row;

    const getAlertTypeContent = useAlertTypeContent();
    const { humanReadable } = getAlertTypeContent(row);

    const { generatePath } = useDetailsNavigator(
        alertDetails.spec_type === 'capture'
            ? authenticatedRoutes.captures.details.overview.fullPath
            : alertDetails.spec_type === 'materialization'
              ? authenticatedRoutes.materializations.details.overview.fullPath
              : authenticatedRoutes.collections.details.overview.fullPath
    );

    return (
        <TableRow>
            {hideEntityName ? null : (
                <EntityNameLink
                    name={catalogName}
                    showEntityStatus={false}
                    detailsLink={generatePath({
                        catalog_name: catalogName,
                    })}
                    entityStatusTypes={[alertDetails.spec_type]}
                />
            )}

            <ActiveOrResolvedCells
                firedAt={firedAt}
                resolvedAt={resolvedAt}
                currentlyActive={Boolean(hideEntityName)}
                hideResolvedAt={hideResolvedAt}
            />

            <TableCell>{humanReadable}</TableCell>

            <TableCell>
                <AlertDetailsWrapper datum={row} hideLabel short />
            </TableCell>

            {/*            <ChipList
                stripPath={false}
                values={
                    alertDetails.recipients?.map(
                        (recipient: any) => recipient.email
                    ) ?? []
                }
            />*/}
        </TableRow>
    );
}

function Rows({ columns, data }: RowsProps) {
    const showEntityName = isColumnVisible(
        columns,
        alertHistoryOptionalColumnIntlKeys.entityName
    );

    const showResolvedAt = isColumnVisible(
        columns,
        alertHistoryOptionalColumnIntlKeys.resolvedAt
    );

    return (
        <>
            {data.map((row, index) => (
                <Row
                    key={`${row.node.alertType}_${index}`}
                    columns={columns}
                    row={row.node}
                    hideEntityName={!showEntityName}
                    hideResolvedAt={!showResolvedAt}
                />
            ))}
        </>
    );
}

export default Rows;
