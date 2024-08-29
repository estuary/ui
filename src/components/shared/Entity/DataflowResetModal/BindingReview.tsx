import { Box, Typography } from '@mui/material';
import ChipList from 'components/shared/ChipList';
import { useBindingStore } from 'stores/Binding/Store';

function BindingReview() {
    const collectionsBeingBackfilled = useBindingStore((state) => {
        return state.backfilledBindings.map((backfilledBinding) => {
            return state.resourceConfigs[backfilledBinding].meta.collectionName;
        });
    });

    return (
        <Box>
            <Typography>
                {collectionsBeingBackfilled.length} Collections that will be
                backfilled
            </Typography>
            <ChipList values={collectionsBeingBackfilled} maxChips={10} />
        </Box>
    );
}

export default BindingReview;
