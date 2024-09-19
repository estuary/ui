import { Stack, Typography } from '@mui/material';
import ChipList from 'components/shared/ChipList';
import { useIntl } from 'react-intl';
import { useBinding_collectionsBeingBackfilled } from 'stores/Binding/hooks';
import Materializations from './Materializations';

function BindingReview() {
    const intl = useIntl();

    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();

    return (
        <Stack direction="column" spacing={2}>
            <Typography>
                {intl.formatMessage(
                    { id: 'dataFlowReset.step1.message' },
                    {
                        entityCount: collectionsBeingBackfilled.length,
                    }
                )}
            </Typography>
            <ChipList values={collectionsBeingBackfilled} maxChips={10} />

            <Materializations selected={collectionsBeingBackfilled} />
        </Stack>
    );
}

export default BindingReview;
