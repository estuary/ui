import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useRef,
} from 'react';

import { debounce } from 'lodash';
import { Entity, SortDirection } from 'types';
import { useIntl } from 'react-intl';
import useConstant from 'use-constant';

import { Grid, Toolbar } from '@mui/material';

import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import SearchField from 'components/shared/toolbar/SearchField';

import { ConnectorWithTagDetailQuery } from 'hooks/useConnectorWithTagDetail';

import { CONNECTOR_NAME } from 'services/supabase';

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
    protocol: Entity | null;
    message: string;
}

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
            protocol: 'capture',
            message: intl.formatMessage({
                id: 'terms.capture',
            }),
        },
        {
            protocol: 'materialization',
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
        setProtocol: (_event: SyntheticEvent, value: string | null) => {
            const selectedProtocol = protocolOptions.find(
                (option) => option.message === value
            )?.protocol;

            setProtocol(selectedProtocol ? selectedProtocol : null);
        },
        setSortBy: (_event: SyntheticEvent, value: string | null) => {
            setSortDirection('asc');

            const selectedColumn = sortByOptions.find(
                (option) => option.message === value
            )?.field;

            setColumnToSort(selectedColumn ? selectedColumn : CONNECTOR_NAME);
        },
        switchSortDirection: (_event: SyntheticEvent, value: string | null) => {
            const selectedDirection = sortDirectionOptions.find(
                (option) => option.message === value
            )?.direction;

            setSortDirection(selectedDirection ? selectedDirection : 'asc');
        },
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
            data-public
        >
            <Grid
                container
                spacing={gridSpacing}
                wrap="wrap"
                sx={{
                    justifyContent: 'flex-end',
                }}
            >
                <Grid item xs={12} md={hideProtocol ? 6 : 4}>
                    <SearchField
                        label={intl.formatMessage({
                            id: 'connectorTable.filterLabel',
                        })}
                        changeHandler={handlers.filterTiles}
                        autoFocus={true}
                    />
                </Grid>

                <Grid item xs={hideProtocol ? 6 : 4} md={2}>
                    <AutocompletedField
                        label={intl.formatMessage({
                            id: 'connectorTable.label.sortBy',
                        })}
                        options={sortByOptions.map(({ message }) => message)}
                        defaultValue={intl.formatMessage({
                            id: 'connectorTable.data.title',
                        })}
                        changeHandler={handlers.setSortBy}
                    />
                </Grid>

                <Grid item xs={hideProtocol ? 6 : 4} md={2}>
                    <AutocompletedField
                        label={intl.formatMessage({
                            id: 'connectorTable.label.sortDirection',
                        })}
                        options={sortDirectionOptions.map(
                            ({ message }) => message
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'sortDirection.ascending',
                        })}
                        changeHandler={handlers.switchSortDirection}
                    />
                </Grid>

                {hideProtocol ? null : (
                    <Grid item xs={4} md={2}>
                        <AutocompletedField
                            label={intl.formatMessage({
                                id: 'connectorTable.data.protocol',
                            })}
                            options={protocolOptions.map(
                                ({ message }) => message
                            )}
                            defaultValue={intl.formatMessage({
                                id: 'common.optionsAll',
                            })}
                            changeHandler={handlers.setProtocol}
                        />
                    </Grid>
                )}
            </Grid>
        </Toolbar>
    );
}

export default ConnectorToolbar;
