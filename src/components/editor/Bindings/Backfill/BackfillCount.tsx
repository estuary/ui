import { Chip } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    useBinding_backfilledBindings_count,
    useBinding_resourceConfigs_count,
} from 'stores/Binding/hooks';

function BackfillCount() {
    const intl = useIntl();
    const backfillCount = useBinding_backfilledBindings_count();
    const bindingsTotal = useBinding_resourceConfigs_count();

    const noBackfill = backfillCount < 1;

    return (
        <Chip
            color={noBackfill ? 'info' : 'success'}
            label={
                noBackfill
                    ? intl.formatMessage({
                          id: 'workflows.collectionSelector.manualBackfill.count.empty',
                      })
                    : intl.formatMessage(
                          {
                              id: 'workflows.collectionSelector.manualBackfill.count',
                          },
                          { backfillCount, bindingsTotal }
                      )
            }
        />
    );
}

export default BackfillCount;
