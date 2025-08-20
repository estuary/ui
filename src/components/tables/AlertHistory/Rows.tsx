import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/AlertHistory/types';

import { TableCell, TableRow } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AlertDetails from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import { alertHistoryOptionalColumnIntlKeys } from 'src/components/tables/AlertHistory/shared';
import ActiveOrResolvedCells from 'src/components/tables/cells/activeResolved/Cells';
import ChipList from 'src/components/tables/cells/ChipList';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { isColumnVisible } from 'src/utils/table-utils';

function Row({ hideEntityName, hideResolvedAt, row }: RowProps) {
    const { catalogName, firedAt, resolvedAt, alertDetails } = row;

    const { humanReadable } = useAlertTypeContent(row);

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
                <AlertDetails datum={row} />
            </TableCell>

            <ChipList
                stripPath={false}
                values={
                    alertDetails.recipients?.map(
                        (recipient: any) => recipient.email
                    ) ?? []
                }
            />
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
            {data.map((row: any, index: number) => (
                <Row
                    key={`alertHistoryTable_${index}`}
                    columns={columns}
                    row={row}
                    hideEntityName={!showEntityName}
                    hideResolvedAt={!showResolvedAt}
                />
            ))}
        </>
    );
}

export default Rows;
