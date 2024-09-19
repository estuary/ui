import { Stack, Typography } from '@mui/material';
import RelatedCollections from 'components/shared/Entity/RelatedCollections';
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
            <RelatedCollections
                collections={collectionsBeingBackfilled}
                newWindow
            />

            <Materializations />
        </Stack>
    );
}

export default BindingReview;
