import type { BackfillCountProps } from 'src/components/editor/Bindings/Backfill/types';

import { Chip } from '@mui/material';

import { useBackfillCountMessage } from 'src/hooks/bindings/useBackfillCountMessage';

function BackfillCount({ disabled }: BackfillCountProps) {
    const { label, noBackfill } = useBackfillCountMessage(disabled);

    return (
        <Chip
            aria-label="Backfill count"
            color={noBackfill || disabled ? 'info' : 'success'}
            variant="outlined"
            label={label}
        />
    );
}

export default BackfillCount;
