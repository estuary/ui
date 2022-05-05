import {
    Autocomplete,
    AutocompleteValue,
    Box,
    Button,
    TextField,
    Typography,
} from '@mui/material';
import useCreationStore, {
    creationSelectors,
} from 'components/materialization/Store';
import { useQuery, useSelect } from 'hooks/supabase-swr/';
import { EventHandler, MouseEvent, useState } from 'react';
import { TABLES } from 'services/supabase';

interface Props {
    preview: EventHandler<any>;
}

interface LiveSpecsQuery {
    catalog_name: string;
    spec_type: string;
    spec: object;
}

const columnsToQuery: (keyof LiveSpecsQuery)[] = ['catalog_name', 'spec_type'];

function CollectionSelector({ preview }: Props) {
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

    const handlers = {
        submit: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setMissingInput(collections.length === 0);

            preview(event);
        },
        updateCollections: (
            event: React.SyntheticEvent,
            value: AutocompleteValue<string, true, false, false>
        ) => {
            setCollections(value);
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

                <Button
                    type="submit"
                    variant="contained"
                    disableElevation
                    onClick={handlers.submit}
                    sx={{ minWidth: 175, ml: 2 }}
                >
                    Preview Catalog
                </Button>
            </Box>
        </Box>
    ) : null;
}

export default CollectionSelector;
