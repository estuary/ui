import {
    Autocomplete,
    Box,
    Button,
    TextField,
    Typography,
} from '@mui/material';
import { useQuery, useSelect } from 'hooks/supabase-swr/';
import { EventHandler } from 'react';
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
    const liveSpecsQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS,
        {
            columns: columnsToQuery,
            filter: (query) => query.eq('spec_type', 'collection'),
        },
        []
    );
    const { data: collections, error } = useSelect(liveSpecsQuery);

    return collections && !error ? (
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
                    options={collections.data}
                    getOptionLabel={(collection) => collection.catalog_name}
                    size="small"
                    filterSelectedOptions
                    fullWidth
                    renderInput={(params) => (
                        <TextField {...params} label="Collections" />
                    )}
                />

                <Button
                    variant="contained"
                    disableElevation
                    onClick={preview}
                    sx={{ minWidth: 175, ml: 2 }}
                >
                    Preview Catalog
                </Button>
            </Box>
        </Box>
    ) : null;
}

export default CollectionSelector;
