import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/AlertHistory/types';

import { useState } from 'react';

import { Collapse, TableCell, TableRow, useTheme } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import DetailsPane from 'src/components/tables/AlertHistory/DetailsPane';
import { alertHistoryOptionalColumnIntlKeys } from 'src/components/tables/AlertHistory/shared';
import ActiveOrResolvedCells from 'src/components/tables/cells/activeResolved/Cells';
import ChipList from 'src/components/tables/cells/ChipList';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import { getEntityTableRowSx } from 'src/context/Theme';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { isColumnVisible } from 'src/utils/table-utils';

function Row({ hideEntityName, row }: RowProps) {
    const { alertType, catalogName, firedAt, resolvedAt, alertDetails } = row;

    const theme = useTheme();
    const { humanReadable } = useAlertTypeContent(alertType);

    const [foo, setFoo] = useState(false);

    const { generatePath } = useDetailsNavigator(
        alertDetails.spec_type === 'capture'
            ? authenticatedRoutes.captures.details.overview.fullPath
            : alertDetails.spec_type === 'materialization'
              ? authenticatedRoutes.materializations.details.overview.fullPath
              : authenticatedRoutes.collections.details.overview.fullPath
    );

    return (
        <>
            <TableRow
                hover
                sx={getEntityTableRowSx(theme)}
                onClick={() => {
                    setFoo(!foo);
                }}
            >
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
                />

                <TableCell>{humanReadable}</TableCell>

                <TableCell>details</TableCell>

                <ChipList
                    stripPath={false}
                    values={alertDetails.recipients.map(
                        (recipient: any) => recipient.email
                    )}
                />
            </TableRow>
            <TableRow sx={{ display: foo ? undefined : 'none' }}>
                <TableCell colSpan={5}>
                    <Collapse unmountOnExit in={foo}>
                        <DetailsPane foo={row} />
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function Rows({ columns, data }: RowsProps) {
    const detailsColumnVisible = isColumnVisible(
        columns,
        alertHistoryOptionalColumnIntlKeys.entityName
    );

    return (
        <>
            {data.map((row: any, index: number) => (
                <Row
                    key={`alertHistoryTable_${index}`}
                    columns={columns}
                    row={row}
                    hideEntityName={!detailsColumnVisible}
                />
            ))}
        </>
    );
}

export default Rows;
