import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import type { GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';

import ReactJson from '@microlink/react-json-view';
import { JsonPointer } from 'json-ptr';
import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

import ListAndDetails from 'src/components/editor/ListAndDetails';
import Error from 'src/components/shared/Error';
import {
    dataGridListStyling,
    jsonViewTheme,
    semiTransparentBackground,
} from 'src/context/Theme';
import type { JournalRecord } from 'src/hooks/journals/types';
import type { useJournalData } from 'src/hooks/journals/useJournalData';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

interface PreviewJsonModeProps {
    spec: LiveSpecsQuery_details;
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
    const intl = useIntl();

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
                    displayBorder
                    list={
                        <DataGrid
                            columns={[
                                {
                                    field: 'key',
                                    headerName: intl.formatMessage({
                                        id: 'detailsPanel.dataPreview.listView.header',
                                    }),
                                    flex: 1,
                                },
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
                            sx={{ ...dataGridListStyling, border: 'none' }}
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
                                theme={jsonViewTheme[theme.palette.mode]}
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
