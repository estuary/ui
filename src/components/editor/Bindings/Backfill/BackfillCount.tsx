import type { BackfillCountProps } from 'src/components/editor/Bindings/Backfill/types';

import { Chip } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBackfillCountMessage } from 'src/hooks/bindings/useBackfillCountMessage';

function BackfillCount({ disabled }: BackfillCountProps) {
    const intl = useIntl();

    const { label, noBackfill } = useBackfillCountMessage(disabled);

    return (
        <Chip
            aria-label={intl.formatMessage({
                id: 'workflows.collectionSelector.manualBackfill.count.aria',
            })}
            color={noBackfill || disabled ? 'info' : 'success'}
            variant="outlined"
            label={label}
        />
    );
}

export default BackfillCount;
