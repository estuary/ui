import {
    Autocomplete,
    AutocompleteRenderInputParams,
    FilledInputProps,
    TextField,
    Toolbar,
} from '@mui/material';
import { slate } from 'context/Theme';
import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';
import { debounce } from 'lodash';
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useMemo,
    useRef,
} from 'react';
import { useIntl } from 'react-intl';
import { CONNECTOR_NAME } from 'services/supabase';
import { ENTITY, SortDirection } from 'types';

interface Props {
    cardWidth: number;
    setColumnToSort: Dispatch<
        SetStateAction<keyof ConnectorWithTagDetailQuery>
    >;
    setProtocol: Dispatch<SetStateAction<string | null>>;
    setSortDirection: Dispatch<SetStateAction<SortDirection>>;
    setSearchQuery: Dispatch<SetStateAction<string | null>>;
}

const inputProps: Partial<FilledInputProps> = {
    disableUnderline: true,
    sx: {
        borderRadius: 5,
        backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
                ? 'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2%, rgba(172, 199, 220, 0.12) 40%)'
                : slate[50],
    },
};

function ConnectorToolbar({
    cardWidth,
    setColumnToSort,
    setProtocol,
    setSortDirection,
    setSearchQuery,
}: Props) {
    const intl = useIntl();
    const isFiltering = useRef(false);

    const paramOptions: {
        field: keyof ConnectorWithTagDetailQuery;
        message: string;
    }[] = useMemo(
        () => [
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
        ],
        [intl]
    );

    const protocolOptions: {
        protocol: ENTITY | null;
        message: string;
    }[] = useMemo(
        () => [
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
        ],
        [intl]
    );

    const sortDirectionOptions: {
        direction: SortDirection;
        message: string;
    }[] = useMemo(
        () => [
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
        ],
        [intl]
    );

    const handlers = {
        filterTiles: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                setSearchQuery(hasQuery ? filterQuery : null);
            },
            750
        ),
        setFilterParam: debounce(
            (_event: SyntheticEvent, value: string | null) => {
                setSortDirection('asc');

                const selectedColumn = paramOptions.find(
                    (option) => option.message === value
                )?.field;

                setColumnToSort(
                    selectedColumn ? selectedColumn : CONNECTOR_NAME
                );
            },
            750
        ),
        setProtocol: debounce(
            (_event: SyntheticEvent, value: string | null) => {
                const selectedProtocol = protocolOptions.find(
                    (option) => option.message === value
                )?.protocol;

                setProtocol(selectedProtocol ? selectedProtocol : null);
            },
            750
        ),
        switchSortDirection: debounce(
            (_event: SyntheticEvent, value: string | null) => {
                const selectedDirection = sortDirectionOptions.find(
                    (option) => option.message === value
                )?.direction;

                setSortDirection(selectedDirection ? selectedDirection : 'asc');
            },
            750
        ),
    };

    return (
        <Toolbar disableGutters sx={{ justifyContent: 'flex-end' }}>
            <Autocomplete
                options={paramOptions.map(({ message }) => message)}
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
                            id: 'connectorTable.label.filterBasis',
                        })}
                        variant="filled"
                    />
                )}
                defaultValue={intl.formatMessage({
                    id: 'connectorTable.data.title',
                })}
                disableClearable
                onChange={handlers.setFilterParam}
                sx={{ width: 150, mr: 2 }}
            />

            <Autocomplete
                options={protocolOptions.map(({ message }) => message)}
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
                sx={{ width: 200, mr: 2 }}
            />

            <Autocomplete
                options={sortDirectionOptions.map(({ message }) => message)}
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
                sx={{ width: 125, mr: 2 }}
            />

            <TextField
                label={intl.formatMessage({
                    id: 'connectorTable.filterLabel',
                })}
                variant="filled"
                InputProps={inputProps}
                onChange={handlers.filterTiles}
                sx={{ width: cardWidth, borderRadius: 5 }}
            />
        </Toolbar>
    );
}

export default ConnectorToolbar;
