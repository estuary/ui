import type { SxProps, Theme } from '@mui/material';
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

import {
    BINDING_STATUS_LABELS,
    getBindingStatusVariant,
    hasBindingVolume,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { RangeChip } from 'src/components/shared/Entity/Details/Overview/RangeChip';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import {
    generateFileName,
    tableExportSeparator,
} from 'src/components/tables/shared';
import { diminishedTextColor } from 'src/context/Theme';
import { BINDING_TERMS } from 'src/settings/entity';

const headingSx: SxProps<Theme> = {
    fontSize: 16,
    fontWeight: 600,
};

interface Props {
    count: number;
    entityType: Entity;
    // The lag columns load separately from `loading`; until they land an
    // export would write them blank, which reads the same as "no reading".
    lagLoading: boolean;
    loading: boolean;
    // The window the figures cover, so an export always matches what the
    // header and table are currently showing.
    range: DataByHourRange;
    rows: BindingRow[];
    totalBytes: number;
    volumesUnavailable: boolean;
}

export function BindingsCardHeader({
    count,
    entityType,
    lagLoading,
    loading,
    range,
    rows,
    totalBytes,
    volumesUnavailable,
}: Props) {
    const theme = useTheme();

    const isCapture = entityType !== 'materialization';

    // Mirrors the table's own columns, so the export matches what the card is
    // showing rather than some other cut of the same rows.
    const exportColumns = useMemo<Columns>(
        () => [
            ...(isCapture
                ? [{ id: 'sourceStream', displayName: 'Source stream' }]
                : []),
            { id: 'collection', displayName: 'Collection' },
            { id: 'status', displayName: 'Status' },
            { id: 'docs', displayName: 'Docs' },
            {
                id: 'bytes',
                displayName: isCapture ? 'Data written' : 'Data read',
            },
            ...(isCapture
                ? [{ id: 'lastData', displayName: 'Last data' }]
                : [
                      { id: 'bytesBehind', displayName: 'Bytes behind' },
                      {
                          id: 'secondsBehind',
                          displayName: 'Time behind (seconds)',
                      },
                  ]),
        ],
        [isCapture]
    );

    const exportData = useMemo(
        () =>
            rows.map((row) => ({
                ...(isCapture ? { sourceStream: row.resourcePath } : {}),
                collection: row.collection,
                status: BINDING_STATUS_LABELS[
                    getBindingStatusVariant(
                        row.status,
                        volumesUnavailable ? undefined : hasBindingVolume(row)
                    )
                ],
                docs: volumesUnavailable ? '' : row.docs,
                bytes: volumesUnavailable ? '' : row.bytes,
                ...(isCapture
                    ? { lastData: row.lastPublishedAt ?? '' }
                    : {
                          bytesBehind: row.bytesBehind ?? '',
                          secondsBehind: row.secondsBehind ?? '',
                      }),
            })),
        [isCapture, rows, volumesUnavailable]
    );

    const exportDisabled = loading || lagLoading || rows.length === 0;

    const [termSingular, termPlural] = BINDING_TERMS[entityType];
    const heading = termPlural.charAt(0).toUpperCase() + termPlural.slice(1);
    const unit = count === 1 ? termSingular : termPlural;
    const verb = entityType === 'materialization' ? 'read' : 'written';

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
                <Typography component="span" sx={headingSx}>
                    {heading}
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
                        `${count} ${unit}${
                            volumesUnavailable
                                ? ''
                                : ` · ${formatBytes(totalBytes)} ${verb}`
                        }`
                    )}
                </Typography>

                <CsvDownload
                    columns={exportColumns}
                    datas={exportData}
                    disabled={exportDisabled}
                    filename={generateFileName(termPlural.replaceAll(' ', '_'))}
                    separator={tableExportSeparator}
                >
                    <Tooltip title="Download CSV">
                        <span>
                            <IconButton
                                aria-label="Download CSV"
                                disabled={exportDisabled}
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
