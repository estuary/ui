import { Stack, Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import ChipList from 'components/shared/ChipList';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import { useShallow } from 'zustand/react/shallow';
import RelatedMaterializations from './RelatedMaterializations';

function BindingReview() {
    const intl = useIntl();

    const collectionsBeingBackfilled = useBindingStore(
        useShallow((state) => {
            return state.backfilledBindings.map((backfilledBinding) => {
                return state.resourceConfigs[backfilledBinding].meta
                    .collectionName;
            });
        })
    );
    return (
        <Stack direction="column" spacing={2}>
            <AlertBox
                short
                severity="warning"
                title={intl.formatMessage({
                    id: 'dataflowReset.warning.title',
                })}
            >
                {intl.formatMessage({ id: 'dataflowReset.warning.message' })}
            </AlertBox>

            <Typography>
                {intl.formatMessage(
                    { id: 'dataflowReset.step1.message' },
                    {
                        entityCount: collectionsBeingBackfilled.length,
                    }
                )}
            </Typography>
            <ChipList values={collectionsBeingBackfilled} maxChips={10} />

            <RelatedMaterializations selected={collectionsBeingBackfilled} />
        </Stack>
    );
}

export default BindingReview;
