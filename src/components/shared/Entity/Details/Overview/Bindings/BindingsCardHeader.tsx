import type { Columns } from 'react-csv-downloader/dist/esm/lib/csv';
import type { DataByHourRange } from 'src/components/graphs/types';
import type { BindingRow } from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { Entity } from 'src/types';

import { useMemo } from 'react';

import {
    IconButton,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { Download } from 'iconoir-react';
import CsvDownload from 'react-csv-downloader';
import { useIntl } from 'react-intl';

import RangeChip from 'src/components/shared/Entity/Details/Overview/RangeChip';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import {
    generateFileName,
    tableExportSeparator,
} from 'src/components/tables/shared';
import {
    cardHeaderSx_emphasized,
    diminishedTextColor,
} from 'src/context/Theme';

interface Props {
    count: number;
    entityType: Entity;
    // Loading and empty both disable the download button: there is nothing
    // meaningful to export yet, or nothing at all.
    loading: boolean;
    // The window the figures cover, so an export always matches what the
    // header and table are currently showing.
    range: DataByHourRange;
    rows: BindingRow[];
    totalBytes: number;
}

/**
 * The Bindings card heading and its summary line.
 *
 * A component rather than inline markup so the Storybook harness renders the
 * same heading as the page does — an inline copy had already drifted on font
 * weight, which made a review screenshot show something the app never showed.
 */
function BindingsCardHeader({
    count,
    entityType,
    loading,
    range,
    rows,
    totalBytes,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const isCapture = entityType !== 'materialization';

    // Mirrors the table's own columns, so the export matches what the card
    // is currently showing rather than some other cut of the same rows.
    const exportColumns = useMemo<Columns>(
        () => [
            ...(isCapture
                ? [
                      {
                          id: 'sourceStream',
                          displayName: intl.formatMessage({
                              id: 'detailsPanel.bindings.column.sourceStream',
                          }),
                      },
                  ]
                : []),
            {
                id: 'collection',
                displayName: intl.formatMessage({
                    id: 'detailsPanel.bindings.column.collection',
                }),
            },
            {
                id: 'status',
                displayName: intl.formatMessage({
                    id: 'detailsPanel.bindings.column.status',
                }),
            },
            {
                id: 'docs',
                displayName: intl.formatMessage({
                    id: 'detailsPanel.bindings.column.docs',
                }),
            },
            {
                id: 'bytes',
                displayName: intl.formatMessage({
                    id: isCapture
                        ? 'detailsPanel.bindings.column.dataWritten'
                        : 'detailsPanel.bindings.column.dataRead',
                }),
            },
            {
                id: 'lastData',
                displayName: intl.formatMessage({
                    id: 'detailsPanel.bindings.column.lastData',
                }),
            },
        ],
        [intl, isCapture]
    );

    const exportData = useMemo(
        () =>
            rows.map((row) => ({
                ...(isCapture ? { sourceStream: row.resourcePath } : {}),
                collection: row.collection,
                status: row.status,
                docs: row.docs,
                bytes: row.bytes,
                lastData: row.lastPublishedAt ?? '',
            })),
        [isCapture, rows]
    );

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'baseline',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                width: '100%',
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography component="span" sx={cardHeaderSx_emphasized}>
                    {intl.formatMessage({ id: 'terms.bindings' })}
                </Typography>

                <RangeChip range={range} />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography
                    component="div"
                    sx={{
                        color: diminishedTextColor[theme.palette.mode],
                        fontSize: 13,
                        fontWeight: 400,
                    }}
                >
                    {loading ? (
                        <Skeleton
                            width={168}
                            sx={{ display: 'inline-block' }}
                        />
                    ) : (
                        intl.formatMessage(
                            {
                                id:
                                    entityType === 'materialization'
                                        ? 'detailsPanel.bindings.subtitle.read'
                                        : 'detailsPanel.bindings.subtitle.written',
                            },
                            {
                                count,
                                // Composed rather than re-pluralised here, so the
                                // word matches everywhere it appears in the app.
                                unit: intl.formatMessage(
                                    { id: 'terms.bindings.plural' },
                                    { count }
                                ),
                                volume: formatBytes(totalBytes),
                            }
                        )
                    )}
                </Typography>

                <CsvDownload
                    columns={exportColumns}
                    datas={exportData}
                    disabled={loading || rows.length === 0}
                    filename={generateFileName('bindings')}
                    separator={tableExportSeparator}
                >
                    <Tooltip
                        title={intl.formatMessage({
                            id: 'detailsPanel.bindings.download',
                        })}
                    >
                        <span>
                            <IconButton
                                aria-label={intl.formatMessage({
                                    id: 'detailsPanel.bindings.download',
                                })}
                                disabled={loading || rows.length === 0}
                                size="small"
                            >
                                <Download height={16} width={16} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </CsvDownload>
            </Stack>
        </Stack>
    );
}

export default BindingsCardHeader;
