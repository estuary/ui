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

import { RangeChip } from 'src/components/shared/Entity/Details/Overview/RangeChip';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import {
    generateFileName,
    tableExportSeparator,
} from 'src/components/tables/shared';
import {
    cardHeaderSx_emphasized,
    diminishedTextColor,
} from 'src/context/Theme';
import { BINDING_TERMS } from 'src/settings/entity';

interface Props {
    count: number;
    entityType: Entity;
    loading: boolean;
    // The window the figures cover, so an export always matches what the
    // header and table are currently showing.
    range: DataByHourRange;
    rows: BindingRow[];
    totalBytes: number;
}

export function BindingsCardHeader({
    count,
    entityType,
    loading,
    range,
    rows,
    totalBytes,
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
            { id: 'lastData', displayName: 'Last data' },
        ],
        [isCapture]
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
                <Typography component="span" sx={cardHeaderSx_emphasized}>
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
                        `${count} ${unit} · ${formatBytes(totalBytes)} ${verb}`
                    )}
                </Typography>

                <CsvDownload
                    columns={exportColumns}
                    datas={exportData}
                    disabled={loading || rows.length === 0}
                    filename={generateFileName(termPlural.replaceAll(' ', '_'))}
                    separator={tableExportSeparator}
                >
                    <Tooltip title="Download CSV">
                        <span>
                            <IconButton
                                aria-label="Download CSV"
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
