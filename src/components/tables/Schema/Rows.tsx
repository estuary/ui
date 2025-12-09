import type { RowProps, RowsProps } from 'src/components/tables/Schema/types';
import type { BuiltProjection } from 'src/types/schemaModels';

import { useMemo } from 'react';

import {
    Box,
    Stack,
    TableCell,
    TableRow,
    Tooltip,
    useTheme,
} from '@mui/material';

import { Lock } from 'iconoir-react';
import { orderBy } from 'lodash';
import { useIntl } from 'react-intl';

import ChipListCell from 'src/components/tables/cells/ChipList';
import { FieldList } from 'src/components/tables/cells/projections/FieldList';
import { ProjectionActions } from 'src/components/tables/cells/projections/ProjectionActions';
import {
    optionalColumnIntlKeys,
    ROW_TYPE_STRING,
} from 'src/components/tables/Schema/shared';
import {
    defaultOutlineColor,
    diminishedTextColor,
    doubleElevationHoverBackground,
    getStickyTableCell,
} from 'src/context/Theme';
import { useEntityWorkflow } from 'src/context/Workflow';
import { basicSort_string } from 'src/utils/misc-utils';
import { translateRedactionStrategy } from 'src/utils/schema-utils';
import { isColumnVisible } from 'src/utils/table-utils';

function Row({ columns, row }: RowProps) {
    const intl = useIntl();
    const theme = useTheme();

    const workflow = useEntityWorkflow();
    const isCaptureWorkflow =
        workflow === 'capture_create' || workflow === 'capture_edit';

    const formattedTypes = useMemo(() => {
        if (row.inference.string?.format && row.inference.types) {
            const stringIndex = row.inference.types.findIndex(
                (rowType: string) => rowType === ROW_TYPE_STRING
            );
            if (stringIndex > -1) {
                row.inference.types[stringIndex] =
                    `${ROW_TYPE_STRING}: ${row.inference.string.format}`;
            }
        }

        return row.inference.types ?? [];
    }, [row]);

    const detailsColumnVisible =
        !isCaptureWorkflow ||
        isColumnVisible(columns, optionalColumnIntlKeys.details);

    const fieldCannotExist = Boolean(row.inference.exists === 'CANNOT');
    const redacted = Boolean(row.inference?.redact && row?.ptr);

    return (
        <TableRow
            sx={{
                '&:hover td': {
                    background:
                        doubleElevationHoverBackground[theme.palette.mode],
                },
            }}
        >
            {redacted ? (
                <TableCell style={{ paddingRight: 0 }}>
                    <Stack style={{ alignItems: 'center' }}>
                        <Tooltip
                            placement="bottom-start"
                            title={
                                redacted
                                    ? intl.formatMessage(
                                          {
                                              id: 'projection.tooltip.locationRedacted',
                                          },
                                          {
                                              strategy:
                                                  translateRedactionStrategy(
                                                      row.inference.redact
                                                  ),
                                          }
                                      )
                                    : ''
                            }
                        >
                            <Lock />
                        </Tooltip>
                    </Stack>
                </TableCell>
            ) : (
                <TableCell />
            )}

            {row.field ? (
                <FieldList
                    cannotExist={fieldCannotExist}
                    editable={isCaptureWorkflow}
                    field={row.field}
                    pointer={row.ptr}
                    sticky
                />
            ) : (
                <TableCell sx={getStickyTableCell()} />
            )}

            <TableCell>
                <Tooltip
                    placement="bottom-start"
                    title={
                        redacted
                            ? intl.formatMessage(
                                  {
                                      id: 'projection.tooltip.locationRedacted',
                                  },
                                  {
                                      strategy: translateRedactionStrategy(
                                          row.inference.redact
                                      ),
                                  }
                              )
                            : ''
                    }
                >
                    <code
                        style={
                            row.inference.redact === 'REDACT_BLOCK'
                                ? {
                                      borderBottom: `1px dashed ${
                                          defaultOutlineColor[
                                              theme.palette.mode
                                          ]
                                      }`,
                                      color: diminishedTextColor[
                                          theme.palette.mode
                                      ],
                                      paddingBottom: 2,
                                  }
                                : undefined
                        }
                    >
                        {row.ptr}
                    </code>
                </Tooltip>
            </TableCell>

            <ChipListCell
                values={formattedTypes}
                stripPath={false}
                maxChips={2}
            />

            {detailsColumnVisible ? (
                <TableCell>
                    <Stack component="span" spacing={1}>
                        {row.inference.title ? (
                            <Box>{row.inference.title}</Box>
                        ) : null}
                        {row.inference.description ? (
                            <Box>{row.inference.description}</Box>
                        ) : null}
                    </Stack>
                </TableCell>
            ) : null}

            {!fieldCannotExist && isCaptureWorkflow && row.field ? (
                <ProjectionActions
                    field={row.field}
                    pointer={row.ptr}
                    redactionStrategy={row.inference?.redact}
                />
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
                    .sort((first: BuiltProjection, second: BuiltProjection) =>
                        basicSort_string(
                            first.field ?? '',
                            second.field ?? '',
                            sortDirection
                        )
                    )
                    .map((record: BuiltProjection, index: number) => (
                        <Row
                            columns={columns}
                            row={record}
                            key={`schema-table-rows-${record.ptr}-${index}`}
                        />
                    ))}
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
                        key={`schema-table-rows-${record.ptr}-${index}`}
                    />
                )
            )}
        </>
    );
}

export default Rows;
