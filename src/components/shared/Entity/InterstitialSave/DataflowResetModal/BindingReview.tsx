import { Box, Typography } from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import ChipList from 'components/shared/ChipList';
import { supabaseClient } from 'context/GlobalProviders';
import { TABLES } from 'services/supabase';
import { BindingReviewProps } from './types';

function BindingReview({ selected }: BindingReviewProps) {
    const response = useQuery(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select('catalog_name')
            .eq('spec_type', 'materialization')
            .overlaps('reads_from', selected)
    );

    console.log('collectionsBeingBackfilled', selected);
    console.log('response', response);

    return (
        <Box>
            <Typography>
                {selected.length} Collections that will be backfilled
            </Typography>
            <ChipList values={selected} maxChips={10} />

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
