import { Button } from '@mui/material';
import { Refresh } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';

export default function RefreshButton() {
    const intl = useIntl();

    const hydrating = useEntityStatusStore((state) => !state.hydrated);
    const loading = useEntityStatusStore((state) => state.loading);
    const refresh = useEntityStatusStore((state) => state.refresh);
    const setLoading = useEntityStatusStore((state) => state.setLoading);

    return (
        <Button
            variant="text"
            startIcon={<Refresh style={{ fontSize: 12 }} />}
            onClick={() => {
                setLoading(true);

                refresh().finally(() => {
                    setLoading(false);
                });
            }}
            disabled={hydrating || loading}
        >
            {intl.formatMessage({ id: 'cta.refresh' })}
        </Button>
    );
}
