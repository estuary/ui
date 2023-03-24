import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridColumnHeaderParams,
    GridRenderCellParams,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import SelectorEmpty from 'components/editor/Bindings/SelectorEmpty';
import { alternativeDataGridHeader, defaultOutline } from 'context/Theme';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { difference } from 'lodash';
import { ReactNode, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUnmount } from 'react-use';
import useConstant from 'use-constant';
import CollectionSelectorRow from './Row';
import CollectionSelectorSearch from './Search';

interface BindingSelectorProps {
    loading: boolean;
    skeleton: ReactNode;
    removeAllCollections: () => void;

    currentCollection?: any;
    setCurrentCollection?: (collection: any) => void;

    collections: Set<string>;
    removeCollection: (collectionName: string) => void;
    addCollection: (collectionName: string) => void;

    readOnly?: boolean;
    RediscoverButton?: ReactNode;

    height?: number;
}

const initialState = {
    columns: {
        columnVisibilityModel: {
            spec_type: false,
        },
    },
};

function CollectionSelector({
    loading,
    skeleton,
    readOnly,
    RediscoverButton,

    collections,
    addCollection,
    removeCollection,
    removeAllCollections,

    currentCollection,
    setCurrentCollection,

    height,
}: BindingSelectorProps) {
    const theme = useTheme();

    const { liveSpecs } = useLiveSpecs('collection');
    const catalogNames = liveSpecs.map((liveSpec) => liveSpec.catalog_name);

    const selectionEnabled = currentCollection && setCurrentCollection;
    const onSelectTimeOut = useRef<number | null>(null);

    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'workflows.collectionSelector.label.listHeader',
        })
    );

    const collectionsArray = Array.from(collections);

    const handlers = {
        removeAllCollections: (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            removeAllCollections();
        },
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: collectionsLabel,
            sortable: false,
            renderHeader: (params: GridColumnHeaderParams) => (
                <Typography>{params.colDef.headerName}</Typography>
            ),
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <CollectionSelectorRow
                        collection={params.value}
                        disabled={false}
                        removeCollection={removeCollection}
                    />
                );
            },
            valueGetter: (params: GridValueGetterParams) => {
                return params.row.name;
            },
        },
    ];

    const rows = collectionsArray.map((collection) => ({
        id: collection,
        name: collection,
    }));

    useUnmount(() => {
        if (onSelectTimeOut.current) clearTimeout(onSelectTimeOut.current);
    });

    return loading ? (
        <Box>{skeleton}</Box>
    ) : (
        <>
            <CollectionSelectorSearch
                options={catalogNames}
                readOnly={readOnly}
                selectedCollections={collectionsArray}
                onChange={(value, reason) => {
                    const change = difference(value, collectionsArray);

                    if (reason === 'selectOption') {
                        addCollection(change[0]);
                    } else if (reason === 'removeOption') {
                        removeCollection(change[0]);
                    }
                }}
            />

            <Box
                sx={{
                    ml: 'auto',
                    borderTop: defaultOutline[theme.palette.mode],
                    borderLeft: defaultOutline[theme.palette.mode],
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    divider={
                        RediscoverButton ? (
                            <Divider
                                orientation="vertical"
                                variant="middle"
                                flexItem
                            />
                        ) : null
                    }
                >
                    {RediscoverButton ? RediscoverButton : null}

                    <Button
                        variant="text"
                        disabled={readOnly ?? rows.length === 0}
                        onClick={handlers.removeAllCollections}
                        sx={{ borderRadius: 0 }}
                    >
                        <FormattedMessage id="workflows.collectionSelector.cta.delete" />
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ height: height ?? 480 }}>
                <DataGrid
                    components={{
                        NoRowsOverlay: SelectorEmpty,
                    }}
                    rows={rows}
                    columns={columns}
                    headerHeight={40}
                    rowCount={rows.length}
                    hideFooter
                    disableColumnSelector
                    disableSelectionOnClick={!selectionEnabled}
                    onRowClick={
                        selectionEnabled
                            ? (params: any) => {
                                  // This is hacky but it works. It clears out the
                                  //  current collection before switching.
                                  //  If a user is typing quickly in a form and then selects a
                                  //  different binding VERY quickly it could cause the updates
                                  //  to go into the wrong form.
                                  setCurrentCollection(null);
                                  onSelectTimeOut.current = window.setTimeout(
                                      () => {
                                          setCurrentCollection(params.row.name);
                                      }
                                  );
                              }
                            : undefined
                    }
                    initialState={initialState}
                    sx={{
                        'borderBottom': 'none',
                        '& .MuiDataGrid-row ': {
                            cursor: 'pointer',
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: defaultOutline[theme.palette.mode],
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderTop: defaultOutline[theme.palette.mode],
                            borderBottom: defaultOutline[theme.palette.mode],
                            bgcolor:
                                alternativeDataGridHeader[theme.palette.mode],
                        },
                        '& .MuiDataGrid-columnHeader:hover': {
                            '& .MuiDataGrid-columnHeaderTitleContainerContent':
                                {
                                    mr: 0.5,
                                },
                            '& .MuiDataGrid-menuIcon': {
                                width: '2rem',
                            },
                        },
                        '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                            width: '100%',
                            justifyContent: 'space-between',
                            mr: 4.5,
                        },
                    }}
                />
            </Box>
        </>
    );
}

export default CollectionSelector;
