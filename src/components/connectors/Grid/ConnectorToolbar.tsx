import type { ChangeEvent, SyntheticEvent } from 'react';
import type {
    ConnectorToolbarProps,
    ProtocolOption,
} from 'src/components/connectors/Grid/types';

import { useRef } from 'react';
import useConstant from 'use-constant';

import { Grid, Toolbar } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { debounce } from 'lodash';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import SearchField from 'src/components/shared/toolbar/SearchField';
import { fireGtmEvent } from 'src/services/gtm';

function ConnectorToolbar({
    belowMd,
    gridSpacing,
    hideProtocol,
    setProtocol,
    setSearchQuery,
}: ConnectorToolbarProps) {
    const postHog = usePostHog();
    const intl = useIntl();
    const isFiltering = useRef(false);

    const protocolOptions: ProtocolOption[] = useConstant(() => [
        {
            protocol: null,
            message: intl.formatMessage({ id: 'common.optionsAll' }),
        },
        {
            protocol: 'capture',
            message: intl.formatMessage({ id: 'terms.capture' }),
        },
        {
            protocol: 'materialization',
            message: intl.formatMessage({ id: 'terms.materialization' }),
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
                    fireGtmEvent('Connector_Search', { filterQuery });

                    postHog.capture('Connector_Search', {
                        filterQuery,
                    });
                }
            },
            750
        ),
    };
    useUnmount(() => {
        handlers.filterTiles.cancel();
    });

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
                sx={{ justifyContent: 'flex-end' }}
            >
                <Grid size={{ xs: 12, md: hideProtocol ? 12 : 6 }}>
                    <SearchField
                        label={intl.formatMessage({
                            id: 'connectorTable.filterLabel',
                        })}
                        changeHandler={handlers.filterTiles}
                        autoFocus={true}
                    />
                </Grid>

                {hideProtocol ? null : (
                    <Grid size={{ xs: 4, md: 2 }}>
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
