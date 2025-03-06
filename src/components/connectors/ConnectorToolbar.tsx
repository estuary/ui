import { Grid, Toolbar } from '@mui/material';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import SearchField from 'components/shared/toolbar/SearchField';
import { debounce } from 'lodash';
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useRef,
} from 'react';
import { useIntl } from 'react-intl';
import { fireGtmEvent } from 'services/gtm';
import { Entity } from 'types';
import useConstant from 'use-constant';

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
                fireGtmEvent('Connector_Search', {
                    filterQuery,
                });
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
