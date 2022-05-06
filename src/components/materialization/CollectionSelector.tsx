import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import useCreationStore, {
    creationSelectors,
} from 'components/materialization/Store';
import { useQuery, useSelect } from 'hooks/supabase-swr/';
import { useState } from 'react';
import { TABLES } from 'services/supabase';

interface LiveSpecsQuery {
    catalog_name: string;
    spec_type: string;
    spec: object;
}

const columnsToQuery: (keyof LiveSpecsQuery)[] = ['catalog_name', 'spec_type'];

function CollectionSelector() {
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

    const collections = useCreationStore(creationSelectors.collections);
    const setCollections = useCreationStore(creationSelectors.setCollection);
    const setResourceConfig = useCreationStore(
        creationSelectors.setResourceConfig
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
                Collection Selector
            </Typography>

            <Typography sx={{ mb: 2 }}>
                Place instructions for collection selector here.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Autocomplete
                    multiple
                    options={collectionData.data.map(
                        ({ catalog_name }) => catalog_name
                    )}
                    size="small"
                    filterSelectedOptions
                    fullWidth
                    onChange={handlers.updateCollections}
                    blurOnSelect={false}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Collections"
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
