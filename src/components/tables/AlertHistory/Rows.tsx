import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/AlertHistory/types';

import { TableCell, TableRow } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AlertDetailsWrapper from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import { alertHistoryOptionalColumnIntlKeys } from 'src/components/tables/AlertHistory/shared';
import ActiveOrResolvedCells from 'src/components/tables/cells/activeResolved/Cells';
import ChipListCell from 'src/components/tables/cells/ChipList';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { isColumnVisible } from 'src/utils/table-utils';

function Row({ hideEntityName, hideResolvedAt, row }: RowProps) {
    const { catalogName, firedAt, resolvedAt, alertDetails } = row;

    const getAlertTypeContent = useAlertTypeContent();
    const { humanReadable, recipientList } = getAlertTypeContent(row);

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

            <TableCell sx={{ whiteSpace: 'nowrap' }}>{humanReadable}</TableCell>

            <ActiveOrResolvedCells
                firedAt={firedAt}
                resolvedAt={resolvedAt}
                currentlyActive={Boolean(hideEntityName)}
                hideResolvedAt={hideResolvedAt}
            />

            <ChipListCell
                forceTooltip
                stripPath={false}
                maxChips={5}
                values={recipientList}
            />

            <TableCell>
                <AlertDetailsWrapper datum={row} hideLabel short />
            </TableCell>
        </TableRow>
    );
}

function Rows({ columns, data }: RowsProps) {
    const hideEntityName = !isColumnVisible(
        columns,
        alertHistoryOptionalColumnIntlKeys.entityName
    );

    const hideResolvedAt = !isColumnVisible(
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
                    hideEntityName={hideEntityName}
                    hideResolvedAt={hideResolvedAt}
                />
            ))}
        </>
    );
}

export default Rows;
