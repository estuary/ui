import type { TableColumns } from 'src/types';

import { TableCell, TableRow, useTheme } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import ChipList from 'src/components/tables/cells/ChipList';
import EntityNameLink from 'src/components/tables/cells/EntityNameLink';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';

interface RowsProps {
    columns: TableColumns[];
    data: any;
}

interface RowProps {
    row: any;
}

function Row({
    row: { catalogName, firedAt, resolvedAt, alertDetails },
}: RowProps) {
    const theme = useTheme();

    const { generatePath } = useDetailsNavigator(
        alertDetails.spec_type === 'capture'
            ? authenticatedRoutes.captures.details.overview.fullPath
            : alertDetails.spec_type === 'materialization'
              ? authenticatedRoutes.materializations.details.overview.fullPath
              : authenticatedRoutes.collections.details.overview.fullPath
    );

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <EntityNameLink
                name={catalogName}
                showEntityStatus={false}
                detailsLink={generatePath({ catalog_name: catalogName })}
                entityStatusTypes={[alertDetails.spec_type]}
            />

            <ChipList
                stripPath={false}
                values={alertDetails.recipients.map(
                    (recipient: any) => recipient.email
                )}
            />

            <TimeStamp time={firedAt} />

            <TableCell>{resolvedAt}</TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row: any) => (
                <Row key={row} row={row} />
            ))}
        </>
    );
}

export default Rows;
