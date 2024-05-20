import { Box, Stack, TableCell, TableRow } from '@mui/material';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import { InferSchemaResponseProperty, Schema, SortDirection } from 'types';
import { basicSort_string } from 'utils/misc-utils';
import ChipListCell from '../cells/ChipList';

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
            row.types[
                row.types.findIndex((rowType) => rowType === rowTypeString)
            ] = `${rowTypeString}: ${row.string_format}`;
        }

        return row.types;
    }, [row]);

    return (
        <TableRow hover>
            <TableCell>
                <Stack
                    direction="row"
                    spacing={1}
                    style={
                        row.exists === 'must'
                            ? { fontWeight: 700 }
                            : { fontStyle: 'italic' }
                    }
                >
                    <Box>{row.name}</Box>
                </Stack>
            </TableCell>

            <TableCell>
                <Box>{row.pointer}</Box>
            </TableCell>

            <ChipListCell values={formattedTypes} stripPath={false} />

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
