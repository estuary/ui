import {
    Box,
    CircularProgress,
    Grid,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import ListAndDetails from 'components/editor/ListAndDetails';
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

const PreviewTableMode = ({ spec, journal }: PreviewTableModeProps) => {
    const jdata = useJournalData(journal.name, 20);

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

    return (
        <div style={{ width: '100%', marginTop: 10 }}>
            {jdata.loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Box}>
                    <Table sx={{ minWidth: 350 }}>
                        {tableHead}
                        {jdata.data.map((row) => (
                            <TableRow key={row._meta.uuid}>
                                {specEntries.map(([k]) => (
                                    <TableCell key={`${row._meta.uuid}_${k}`}>
                                        {row[k]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </Table>
                </TableContainer>
            )}
        </div>
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

    const [useJsonMode] = useState(true);

    return journal ? (
        useJsonMode ? (
            <PreviewJsonMode journal={journal} spec={spec} />
        ) : (
            <PreviewTableMode journal={journal} spec={spec} />
        )
    ) : null;
}
