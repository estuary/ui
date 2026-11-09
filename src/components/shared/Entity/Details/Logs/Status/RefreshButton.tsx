import { Button } from '@mui/material';

import { Refresh } from 'iconoir-react';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';

export default function RefreshButton() {
    const loading = useEntityStatusStore(
        (state) => !state.hydrated || state.active
    );
    const refresh = useEntityStatusStore((state) => state.refresh);
    const setActive = useEntityStatusStore((state) => state.setActive);

    return (
        <Button
            variant="text"
            startIcon={<Refresh style={{ fontSize: 12 }} />}
            onClick={() => {
                setActive(true);

                refresh().finally(() => {
                    setActive(false);
                });

                logRocketEvent(`${CustomEvents.ENTITY_STATUS}:Refresh`);
            }}
            disabled={loading}
        >
            Refresh
        </Button>
    );
}
