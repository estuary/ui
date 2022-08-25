import {
    Grid,
    LinearProgress,
    Paper,
    SxProps,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
} from '@mui/material';
import Error from 'components/shared/Error';
import { tableAlternateRowsSx } from 'context/Theme';
import { useJournalData } from 'hooks/useJournalData';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import { useMemo } from 'react';

interface PreviewTableModeProps {
    spec: LiveSpecsQuery_spec;
    journalData: ReturnType<typeof useJournalData>;
}

const heightSx: SxProps<Theme> = {
    minHeight: 350,
    maxHeight: 350,
};

function TableView({ journalData, spec }: PreviewTableModeProps) {
    const specEntries = useMemo(
        // TODO (typing) we need to fix typing
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        () => Object.entries(spec?.spec?.schema?.properties ?? {}),
        [spec]
    );

    const tableHead = useMemo(
        () => (
            <TableHead>
                <TableRow>
                    {specEntries.map(([key, _fieldSpec]) => (
                        <TableCell key={key}>{key}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
        ),
        [specEntries]
    );

    const tableBody = useMemo(
        () => (
            <TableBody
                sx={{
                    ...tableAlternateRowsSx,
                }}
            >
                {journalData.data.map((row) => (
                    <TableRow key={row._meta.uuid}>
                        {specEntries.map(([k]) => (
                            <TableCell key={`${row._meta.uuid}_${k}`}>
                                {row[k]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        ),
        [journalData.data, specEntries]
    );

    if (journalData.error) {
        return <Error error={journalData.error} />;
    }

    return (
        <Grid item xs={12}>
            <Paper
                sx={{
                    ...heightSx,
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                {journalData.loading ? <LinearProgress /> : null}

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
