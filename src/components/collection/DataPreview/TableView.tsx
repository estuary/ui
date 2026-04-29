import type { SxProps, Theme } from '@mui/material';
import type { useJournalData } from 'src/hooks/journals/useJournalData';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useMemo } from 'react';

import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';

import Error from 'src/components/shared/Error';
import { tableAlternateRowsSx } from 'src/context/Theme';
import { hasLength } from 'src/utils/misc-utils';

interface PreviewTableModeProps {
    spec: LiveSpecsQuery_details;
    journalData: ReturnType<typeof useJournalData>;
}

const heightSx: SxProps<Theme> = {
    minHeight: 320,
    maxHeight: 320,
};

function TableView({
    journalData: { data, error },
    spec,
}: PreviewTableModeProps) {
    const specEntries = useMemo(
        // TODO (typing) we need to fix typing
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        () => Object.entries(spec?.spec?.schema?.properties ?? {}),
        [spec]
    );

    const tableHead = useMemo(
        () =>
            hasLength(specEntries) ? (
                <TableHead>
                    <TableRow>
                        {specEntries.map(([key, _fieldSpec]) => (
                            <TableCell key={key}>{key}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
            ) : (
                <TableHead>
                    <TableRow>
                        <TableCell> </TableCell>
                    </TableRow>
                </TableHead>
            ),
        [specEntries]
    );

    const tableBody = useMemo(() => {
        return (
            <TableBody
                sx={{
                    ...tableAlternateRowsSx,
                }}
            >
                {hasLength(specEntries) ? (
                    data?.documents.map((row) => (
                        <TableRow key={row._meta.uuid}>
                            {specEntries.map(([k]) => {
                                return (
                                    <TableCell key={`${row._meta.uuid}_${k}`}>
                                        {row[k]}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center',
                            }}
                        >
                            <FormattedMessage id="detailsPanel.dataPreview.failedParsingMessage" />
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        );
    }, [data, specEntries]);

    if (error) {
        return <Error error={error} />;
    }

    return (
        <Grid size={{ xs: 12 }} data-private>
            <Paper
                variant="outlined"
                sx={{
                    ...heightSx,
                    width: '100%',
                    overflow: 'hidden',
                    mb: 2,
                }}
            >
                <TableContainer sx={{ ...heightSx }}>
                    <Table stickyHeader sx={{ ...heightSx }}>
                        {tableHead}
                        {tableBody}
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
    );
}

export default TableView;
