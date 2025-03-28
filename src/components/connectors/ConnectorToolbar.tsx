import type {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent} from 'react';
import {
    useRef,
} from 'react';
import useConstant from 'use-constant';

import { Grid, Toolbar } from '@mui/material';

import { debounce } from 'lodash';
import { useIntl } from 'react-intl';

import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import SearchField from 'src/components/shared/toolbar/SearchField';
import { fireGtmEvent } from 'src/services/gtm';
import type { Entity } from 'src/types';

interface Props {
    belowMd: boolean;
    gridSpacing: number;
    hideProtocol?: boolean;
    setProtocol: Dispatch<SetStateAction<string | null>>;
    setSearchQuery: Dispatch<SetStateAction<string | null>>;
}

interface ProtocolOption {
    protocol: Entity | null;
    message: string;
}

function ConnectorToolbar({
    belowMd,
    gridSpacing,
    hideProtocol,
    setProtocol,
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

    const handlers = {
        setProtocol: (_event: SyntheticEvent, value: string | null) => {
            const selectedProtocol = protocolOptions.find(
                (option) => option.message === value
            )?.protocol;

            setProtocol(selectedProtocol ? selectedProtocol : null);
        },
        filterTiles: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                setSearchQuery(hasQuery ? filterQuery : null);

                // Only fire the event if there is a query to send back
                if (hasQuery) {
                    fireGtmEvent('Connector_Search', {
                        filterQuery,
                    });
                }
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
                <Grid item xs={12} md={hideProtocol ? 12 : 6}>
                    <SearchField
                        label={intl.formatMessage({
                            id: 'connectorTable.filterLabel',
                        })}
                        changeHandler={handlers.filterTiles}
                        autoFocus={true}
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
