import type { RowProps, RowsProps } from 'src/components/tables/Schema/types';
import type { InferSchemaResponseProperty } from 'src/types';

import { useMemo } from 'react';

import { Box, Stack, TableCell, TableRow } from '@mui/material';

import { orderBy } from 'lodash';

import ChipListCell from 'src/components/tables/cells/ChipList';
import { FieldList } from 'src/components/tables/cells/projections/FieldList';
import { ProjectionActions } from 'src/components/tables/cells/projections/ProjectionActions';
import {
    optionalColumnIntlKeys,
    ROW_TYPE_STRING,
} from 'src/components/tables/Schema/shared';
import {
    doubleElevationHoverBackground,
    getStickyTableCell,
} from 'src/context/Theme';
import { useEntityWorkflow } from 'src/context/Workflow';
import { basicSort_string } from 'src/utils/misc-utils';
import { isColumnVisible } from 'src/utils/table-utils';

function Row({ columns, row }: RowProps) {
    const workflow = useEntityWorkflow();
    const isCaptureWorkflow =
        workflow === 'capture_create' || workflow === 'capture_edit';

    const formattedTypes = useMemo(() => {
        if (row.string_format) {
            const stringIndex = row.types.findIndex(
                (rowType) => rowType === ROW_TYPE_STRING
            );
            if (stringIndex > -1) {
                row.types[stringIndex] =
                    `${ROW_TYPE_STRING}: ${row.string_format}`;
            }
        }

        return row.types;
    }, [row]);

    const detailsColumnVisible =
        !isCaptureWorkflow ||
        isColumnVisible(columns, optionalColumnIntlKeys.details);

    return (
        <TableRow
            sx={{
                '&:hover td': {
                    background: (theme) =>
                        doubleElevationHoverBackground[theme.palette.mode],
                },
            }}
        >
            {row.name ? (
                <FieldList
                    editable={isCaptureWorkflow}
                    field={row.name}
                    pointer={row.pointer}
                    sticky
                />
            ) : (
                <TableCell sx={getStickyTableCell()} />
            )}

            <TableCell>
                <code>{row.pointer}</code>
            </TableCell>

            <ChipListCell
                values={formattedTypes}
                stripPath={false}
                maxChips={2}
            />

            {detailsColumnVisible ? (
                <TableCell>
                    <Stack component="span" spacing={1}>
                        {row.title ? <Box>{row.title}</Box> : null}
                        {row.description ? <Box>{row.description}</Box> : null}
                    </Stack>
                </TableCell>
            ) : null}

            {isCaptureWorkflow && row.name ? (
                <ProjectionActions field={row.name} pointer={row.pointer} />
            ) : isCaptureWorkflow ? (
                <TableCell />
            ) : null}
        </TableRow>
    );
}

function Rows({ columns, data, sortDirection, columnToSort }: RowsProps) {
    if (!data) {
        return null;
    }

    // We only do special sorting for name - otherwise we can use lodash
    //  We're probably safe always using the method above but made them
    //  different so we can have special control when sorting the fields
    //  in case we want to make more customizations
    if (columnToSort === 'name') {
        return (
            <>
                {data
                    .filter(
                        (datum: InferSchemaResponseProperty) =>
                            datum.exists === 'may' || datum.exists === 'must'
                    )
                    .sort(
                        (
                            first: InferSchemaResponseProperty,
                            second: InferSchemaResponseProperty
                        ) =>
                            basicSort_string(
                                first.name ?? '',
                                second.name ?? '',
                                sortDirection
                            )
                    )
                    .map(
                        (
                            record: InferSchemaResponseProperty,
                            index: number
                        ) => (
                            <Row
                                columns={columns}
                                row={record}
                                key={`schema-table-rows-${index}`}
                            />
                        )
                    )}
            </>
        );
    }

    // Just use the plain orderBy when not sorting names.
    return (
        <>
            {orderBy(data, [columnToSort], [sortDirection]).map(
                (record, index) => (
                    <Row
                        columns={columns}
                        row={record}
                        key={`schema-table-rows-${index}`}
                    />
                )
            )}
        </>
    );
}

export default Rows;
