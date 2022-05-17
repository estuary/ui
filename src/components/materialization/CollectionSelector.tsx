import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { useQuery, useSelect } from 'hooks/supabase-swr/';
import { useRouteStore } from 'hooks/useRouteStore';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';
import { entityCreateStoreSelectors } from 'stores/Create';
import useConstant from 'use-constant';

interface LiveSpecsQuery {
    catalog_name: string;
    spec_type: string;
    spec: object;
}

const columnsToQuery: (keyof LiveSpecsQuery)[] = ['catalog_name', 'spec_type'];

function CollectionSelector() {
    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({ id: 'terms.collections' })
    );
    const [missingInput, setMissingInput] = useState(false);

    const liveSpecsQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS,
        {
            columns: columnsToQuery,
            filter: (query) => query.eq('spec_type', 'collection'),
        },
        []
    );
    const { data: collectionData, error } = useSelect(liveSpecsQuery);

    const entityCreateStore = useRouteStore();
    const collections = entityCreateStore(
        entityCreateStoreSelectors.collections
    );
    const setCollections = entityCreateStore(
        entityCreateStoreSelectors.setCollections
    );
    const setResourceConfig = entityCreateStore(
        entityCreateStoreSelectors.setResourceConfig
    );

    const handlers = {
        updateCollections: (event: React.SyntheticEvent, value: any) => {
            setCollections(value);
            setResourceConfig(value[value.length - 1]);
        },
        validateSelection: () => {
            setMissingInput(collections.length === 0);
        },
    };

    return collectionData && !error ? (
        <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
                <FormattedMessage id="materializationCreation.collectionSelector.heading" />
            </Typography>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreation.collectionSelector.instructions" />
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Autocomplete
                    multiple
                    options={collectionData.data.map(
                        ({ catalog_name }) => catalog_name
                    )}
                    value={collections}
                    size="small"
                    filterSelectedOptions
                    fullWidth
                    onChange={handlers.updateCollections}
                    blurOnSelect={false}
                    disableCloseOnSelect
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={collectionsLabel}
                            required
                            error={missingInput}
                            onBlur={handlers.validateSelection}
                        />
                    )}
                />
            </Box>
        </Box>
    ) : null;
}

export default CollectionSelector;
