import { Box, Typography } from '@mui/material';
import ChipList from 'components/shared/ChipList';
import RelatedMaterializations from './RelatedMaterializations';
import { BindingReviewProps } from './types';

function BindingReview({ selected }: BindingReviewProps) {
    return (
        <Box>
            <Typography>
                {selected.length} Collections that will be backfilled
            </Typography>
            <ChipList values={selected} maxChips={10} />

            <RelatedMaterializations selected={selected} />
        </Box>
    );
}

export default BindingReview;
