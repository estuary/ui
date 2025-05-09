import type {
    InferSchemaResponseProperty,
    Schema,
    SortDirection,
} from 'src/types';

import { useMemo } from 'react';

import { Box, Stack, TableCell, TableRow } from '@mui/material';

import { orderBy } from 'lodash';

import ChipListCell from 'src/components/tables/cells/ChipList';
import { EditableField } from 'src/components/tables/cells/EditableField';
import { basicSort_string } from 'src/utils/misc-utils';

interface RowProps {
    row: InferSchemaResponseProperty;
}

interface RowsProps {
    data: Schema | null;
    sortDirection: SortDirection;
    columnToSort: string;
}

const rowTypeString = 'string';

function Row({ row }: RowProps) {
    const formattedTypes = useMemo(() => {
        if (row.string_format) {
            const stringIndex = row.types.findIndex(
                (rowType) => rowType === rowTypeString
            );
            if (stringIndex > -1) {
                row.types[stringIndex] =
                    `${rowTypeString}: ${row.string_format}`;
            }
        }

        return row.types;
    }, [row]);

    return (
        <TableRow hover>
            <EditableField
                buttonStyles={
                    row.exists === 'must'
                        ? { fontWeight: 700 }
                        : { fontStyle: 'italic' }
                }
                field={row.name ?? ''}
                pointer={row.pointer}
            />

            <TableCell>
                <Box>{row.pointer}</Box>
            </TableCell>

            <ChipListCell
                values={formattedTypes}
                stripPath={false}
                maxChips={2}
            />

            <TableCell>
                <Stack component="span" spacing={1}>
                    {row.title ? <Box>{row.title}</Box> : null}
                    {row.description ? <Box>{row.description}</Box> : null}
                </Stack>
            </TableCell>
        </TableRow>
    );
}

function Rows({ data, sortDirection, columnToSort }: RowsProps) {
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
                    <Row row={record} key={`schema-table-rows-${index}`} />
                )
            )}
        </>
    );
}

export default Rows;
