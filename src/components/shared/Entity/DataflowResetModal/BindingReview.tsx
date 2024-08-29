import { Box, Typography } from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import ChipList from 'components/shared/ChipList';
import { supabaseClient } from 'context/GlobalProviders';
import { TABLES } from 'services/supabase';
import { useBindingStore } from 'stores/Binding/Store';
import { useShallow } from 'zustand/react/shallow';

function BindingReview() {
    const collectionsBeingBackfilled = useBindingStore(
        useShallow((state) => {
            return state.backfilledBindings.map((backfilledBinding) => {
                return state.resourceConfigs[backfilledBinding].meta
                    .collectionName;
            });
        })
    );

    const response = useQuery(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select('catalog_name')
            .eq('spec_type', 'materialization')
            .overlaps('reads_from', collectionsBeingBackfilled)
    );

    console.log('collectionsBeingBackfilled', collectionsBeingBackfilled);
    console.log('response', response);

    return (
        <Box>
            <Typography>
                {collectionsBeingBackfilled.length} Collections that will be
                backfilled
            </Typography>
            <ChipList values={collectionsBeingBackfilled} maxChips={10} />

            <Box>
                <Typography>
                    Select which Materialization you want backfilled
                </Typography>
                <ChipList
                    values={
                        response.data
                            ? response.data.map((datum) => datum.catalog_name)
                            : []
                    }
                    maxChips={10}
                />
            </Box>
        </Box>
    );
}

export default BindingReview;
