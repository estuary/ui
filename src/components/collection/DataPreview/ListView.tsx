import { Box, Grid, useTheme } from '@mui/material';
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import ListAndDetails from 'components/editor/ListAndDetails';
import Error from 'components/shared/Error';
import { dataGridListStyling, semiTransparentBackground } from 'context/Theme';
import { JournalRecord, useJournalData } from 'hooks/journals/useJournalData';
import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';
import { JsonPointer } from 'json-ptr';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactJson from 'react-json-view';

interface PreviewJsonModeProps {
    spec: LiveSpecsQuery_spec;
    journalData: ReturnType<typeof useJournalData>;
}

function ListView({
    spec,
    journalData: { data, error },
}: PreviewJsonModeProps) {
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
        []
    );

    const theme = useTheme();
    const jsonTheme =
        theme.palette.mode === 'dark' ? 'bright' : 'bright:inverted';

    const buildRecordKey = useCallback(
        (record: Record<string, any>) => {
            return spec.spec.key
                .map((k: string) => JsonPointer.get(record, k))
                .join('_');
        },
        [spec.spec.key]
    );

    const rowsByKey = useMemo(() => {
        if (error === null && !!data) {
            return Object.assign(
                {},
                ...data.documents.map((record) => ({
                    [buildRecordKey(record)]: record,
                }))
            ) as Record<string, JournalRecord<Record<string, any>>>;
        } else {
            return {};
        }
    }, [buildRecordKey, data, error]);

    useEffect(() => {
        if (!isEmpty(rowsByKey)) {
            const firstKey = Object.keys(rowsByKey)[0];
            setSelectedKey(firstKey);
            setSelectionModel([firstKey]);
        }
    }, [rowsByKey]);

    return (
        <Grid item xs={12} data-private>
            {error ? (
                <Error error={error} />
            ) : (
                <ListAndDetails
                    backgroundColor={
                        semiTransparentBackground[theme.palette.mode]
                    }
                    list={
                        <DataGrid
                            columns={[
                                { field: 'key', headerName: 'Key', flex: 1 },
                            ]}
                            rows={Object.entries(rowsByKey).map(([k]) => ({
                                key: k,
                                id: k,
                            }))}
                            hideFooter
                            disableColumnSelector
                            columnHeaderHeight={40}
                            rowCount={data?.documents.length}
                            onRowClick={(params) =>
                                setSelectedKey(params.row.key)
                            }
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={(newSelectionModel) => {
                                setSelectionModel(newSelectionModel);
                            }}
                            sx={dataGridListStyling}
                        />
                    }
                    details={
                        <Box
                            sx={{
                                'm': 2,
                                '& .react-json-view': {
                                    backgroundColor: 'transparent !important',
                                },
                            }}
                        >
                            <ReactJson
                                style={{ wordBreak: 'break-all' }}
                                quotesOnKeys={false}
                                src={rowsByKey[selectedKey]}
                                theme={jsonTheme}
                                displayObjectSize={false}
                                displayDataTypes={false}
                            />
                        </Box>
                    }
                />
            )}
        </Grid>
    );
}

export default ListView;
