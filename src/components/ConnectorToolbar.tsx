import {
    Autocomplete,
    AutocompleteRenderInputParams,
    FilledInputProps,
    Grid,
    SxProps,
    TextField,
    Theme,
    Toolbar,
} from '@mui/material';
import {
    darkGlassBkgColor,
    darkGlassBkgColorIntensified,
    slate,
} from 'context/Theme';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { debounce } from 'lodash';
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useRef,
} from 'react';
import { useIntl } from 'react-intl';
import { CONNECTOR_NAME } from 'services/supabase';
import { ENTITY, SortDirection } from 'types';
import useConstant from 'use-constant';

interface Props {
    belowMd: boolean;
    gridSpacing: number;
    setColumnToSort: Dispatch<
        SetStateAction<keyof ConnectorWithTagDetailQuery>
    >;
    hideProtocol?: boolean;
    setProtocol: Dispatch<SetStateAction<string | null>>;
    setSortDirection: Dispatch<SetStateAction<SortDirection>>;
    setSearchQuery: Dispatch<SetStateAction<string | null>>;
}

interface ProtocolOption {
    protocol: ENTITY | null;
    message: string;
}

const inputProps: Partial<FilledInputProps> = {
    disableUnderline: true,
    sx: {
        borderRadius: 5,
        backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? darkGlassBkgColor : slate[50],
    },
};

const toolbarSectionSx: SxProps<Theme> = {
    '& .MuiInputLabel-root.Mui-focused': {
        color: (theme) =>
            theme.palette.mode === 'dark'
                ? 'primary'
                : theme.palette.text.secondary,
    },
    '& .MuiFilledInput-root:hover, .MuiFilledInput-root.Mui-focused': {
        backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
                ? darkGlassBkgColorIntensified
                : 'rgba(80, 114, 235, 0.09)',
    },
};

function ConnectorToolbar({
    belowMd,
    gridSpacing,
    setColumnToSort,
    hideProtocol,
    setProtocol,
    setSortDirection,
    setSearchQuery,
}: Props) {
    const intl = useIntl();
    const isFiltering = useRef(false);

    const protocolOptions: ProtocolOption[] = useConstant(() => [
        {
            protocol: null,
            message: intl.formatMessage({
                id: 'common.optionsAll',
            }),
        },
        {
            protocol: ENTITY.CAPTURE,
            message: intl.formatMessage({
                id: 'terms.capture',
            }),
        },
        {
            protocol: ENTITY.MATERIALIZATION,
            message: intl.formatMessage({
                id: 'terms.materialization',
            }),
        },
    ]);

    const sortByOptions: {
        field: keyof ConnectorWithTagDetailQuery;
        message: string;
    }[] = useConstant(() => [
        {
            field: CONNECTOR_NAME,
            message: intl.formatMessage({
                id: 'connectorTable.data.title',
            }),
        },
        {
            field: 'image_name',
            message: intl.formatMessage({
                id: 'connectorTable.data.image_name',
            }),
        },
    ]);

    const sortDirectionOptions: {
        direction: SortDirection;
        message: string;
    }[] = useConstant(() => [
        {
            direction: 'asc',
            message: intl.formatMessage({
                id: 'sortDirection.ascending',
            }),
        },
        {
            direction: 'desc',
            message: intl.formatMessage({
                id: 'sortDirection.descending',
            }),
        },
    ]);

    const handlers = {
        setProtocol: debounce(
            (_event: SyntheticEvent, value: string | null) => {
                const selectedProtocol = protocolOptions.find(
                    (option) => option.message === value
                )?.protocol;

                setProtocol(selectedProtocol ? selectedProtocol : null);
            },
            750
        ),
        setSortBy: debounce((_event: SyntheticEvent, value: string | null) => {
            setSortDirection('asc');

            const selectedColumn = sortByOptions.find(
                (option) => option.message === value
            )?.field;

            setColumnToSort(selectedColumn ? selectedColumn : CONNECTOR_NAME);
        }, 750),
        switchSortDirection: debounce(
            (_event: SyntheticEvent, value: string | null) => {
                const selectedDirection = sortDirectionOptions.find(
                    (option) => option.message === value
                )?.direction;

                setSortDirection(selectedDirection ? selectedDirection : 'asc');
            },
            750
        ),
        filterTiles: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                setSearchQuery(hasQuery ? filterQuery : null);
            },
            750
        ),
    };

    return (
        <Toolbar
            disableGutters
            sx={{ flexDirection: belowMd ? 'column' : 'row' }}
        >
            <Grid
                container
                spacing={gridSpacing}
                wrap="wrap-reverse"
                sx={{
                    justifyContent: 'flex-end',
                }}
            >
                <Grid item xs={5} md={3}>
                    <TextField
                        label={intl.formatMessage({
                            id: 'connectorTable.filterLabel',
                        })}
                        variant="filled"
                        InputProps={inputProps}
                        onChange={handlers.filterTiles}
                        sx={{
                            width: '100%',
                            borderRadius: 5,
                            ...toolbarSectionSx,
                        }}
                    />
                </Grid>

                <Grid item xs={3} md={2}>
                    <Autocomplete
                        options={sortByOptions.map(({ message }) => message)}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    ...inputProps,
                                }}
                                label={intl.formatMessage({
                                    id: 'connectorTable.label.sortBy',
                                })}
                                variant="filled"
                            />
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'connectorTable.data.title',
                        })}
                        disableClearable
                        onChange={handlers.setSortBy}
                        sx={toolbarSectionSx}
                    />
                </Grid>

                <Grid item xs={3} md={2}>
                    <Autocomplete
                        options={sortDirectionOptions.map(
                            ({ message }) => message
                        )}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    ...inputProps,
                                }}
                                label={intl.formatMessage({
                                    id: 'connectorTable.label.sortDirection',
                                })}
                                variant="filled"
                            />
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'sortDirection.ascending',
                        })}
                        disableClearable
                        onChange={handlers.switchSortDirection}
                        sx={toolbarSectionSx}
                    />
                </Grid>

                {hideProtocol ? null : (
                    <Grid item xs={5} md={2}>
                        <Autocomplete
                            options={protocolOptions.map(
                                ({ message }) => message
                            )}
                            renderInput={({
                                InputProps,
                                ...params
                            }: AutocompleteRenderInputParams) => (
                                <TextField
                                    {...params}
                                    InputProps={{
                                        ...InputProps,
                                        ...inputProps,
                                    }}
                                    label={intl.formatMessage({
                                        id: 'connectorTable.data.protocol',
                                    })}
                                    variant="filled"
                                />
                            )}
                            defaultValue={intl.formatMessage({
                                id: 'common.optionsAll',
                            })}
                            disableClearable
                            onChange={handlers.setProtocol}
                            sx={toolbarSectionSx}
                        />
                    </Grid>
                )}
            </Grid>
        </Toolbar>
    );
}

export default ConnectorToolbar;
