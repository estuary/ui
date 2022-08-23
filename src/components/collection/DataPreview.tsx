import {
    Box,
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
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import ListAndDetails from 'components/editor/ListAndDetails';
import Error from 'components/shared/Error';
import { tableAlternateRowsSx } from 'context/Theme';
import { ProtocolJournalSpec } from 'data-plane-gateway/types/gen/broker/protocol/broker';
import {
    JournalRecord,
    useJournalData,
    useJournalsForCollection,
} from 'hooks/useJournalData';
import { LiveSpecsQuery_spec, useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import { useCallback, useMemo, useState } from 'react';

interface PreviewTableModeProps {
    spec: LiveSpecsQuery_spec;
    journal: ProtocolJournalSpec;
}

const heightSx: SxProps<Theme> = {
    minHeight: 350,
    maxHeight: 350,
};

const PreviewTableMode = ({ spec, journal }: PreviewTableModeProps) => {
    const jdata = useJournalData(journal.name, 20);

    console.log('jdata = ', jdata);

    const specEntries = useMemo(
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
                {jdata.data.map((row) => (
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
        [jdata.data, specEntries]
    );

    if (jdata.error) {
        return <Error error={jdata.error} />;
    }

    return (
        <Paper
            sx={{
                ...heightSx,
                m: 2,
                width: '100%',
                overflow: 'hidden',
            }}
        >
            {jdata.loading ? (
                <LinearProgress />
            ) : (
                <TableContainer sx={{ ...heightSx }}>
                    <Table stickyHeader sx={{ ...heightSx }}>
                        {tableHead}
                        {tableBody}
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

interface PreviewJsonModeProps {
    spec: LiveSpecsQuery_spec;
    journal: ProtocolJournalSpec;
}

const PreviewJsonMode = ({ spec, journal }: PreviewJsonModeProps) => {
    const jdata = useJournalData(journal.name, 20);

    const buildRecordKey = useCallback(
        (record: Record<string, any>) => {
            return spec.spec.key.map((k: string) => record[k]).join('_');
        },
        [spec.spec.key]
    );

    const rowsByKey = useMemo(() => {
        if (!jdata.loading && jdata.error === null) {
            return Object.assign(
                {},
                ...jdata.data.map((record) => ({
                    [buildRecordKey(record)]: record,
                }))
            ) as Record<string, JournalRecord<Record<string, any>>>;
        } else {
            return {};
        }
    }, [buildRecordKey, jdata.data, jdata.error, jdata.loading]);

    const [selectedKey, setSelectedKey] = useState<string>('');
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>(
        []
    );

    return (
        <Grid item xs={12}>
            <ListAndDetails
                list={
                    <DataGrid
                        columns={[{ field: 'key', headerName: 'Key', flex: 1 }]}
                        rows={Object.entries(rowsByKey).map(([k]) => ({
                            key: k,
                            id: k,
                        }))}
                        hideFooter
                        disableColumnSelector
                        headerHeight={40}
                        rowCount={jdata.data.length}
                        onRowClick={(params) => setSelectedKey(params.row.key)}
                        selectionModel={selectionModel}
                        onSelectionModelChange={(newSelectionModel) => {
                            setSelectionModel(newSelectionModel);
                        }}
                    />
                }
                details={
                    <pre>{JSON.stringify(rowsByKey[selectedKey], null, 4)}</pre>
                }
            />
        </Grid>
    );
};

interface Props {
    collectionName: string;
}

enum Views {
    table = 'table',
    json = 'json',
}

export function CollectionPreview({ collectionName }: Props) {
    const { liveSpecs: publicationSpecs } = useLiveSpecs_spec(
        `datapreview-${collectionName}`,
        [collectionName]
    );

    const spec = useMemo(() => publicationSpecs[0], [publicationSpecs]);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journals = useJournalsForCollection(spec?.catalog_name);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journal = useMemo(() => journals.data?.journals?.[0], [journals]);

    const [previewMode, setPreviewMode] = useState<Views>(Views.table);

    const toggleMode = (_event: any, newValue: Views) => {
        setPreviewMode(newValue);
    };

    if (journal) {
        return (
            <>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        m: 0,
                        mr: 2,
                        mt: 2,
                        width: '100%',
                    }}
                >
                    <ToggleButtonGroup
                        color="primary"
                        exclusive
                        onChange={toggleMode}
                        value={previewMode}
                        sx={{}}
                    >
                        <ToggleButton value={Views.table}>Table</ToggleButton>
                        <ToggleButton value={Views.json}>List</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {previewMode === Views.json ? (
                    <PreviewJsonMode journal={journal} spec={spec} />
                ) : (
                    <PreviewTableMode journal={journal} spec={spec} />
                )}
            </>
        );
    }

    return null;
}
