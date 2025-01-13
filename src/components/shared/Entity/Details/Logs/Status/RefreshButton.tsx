import { Button } from '@mui/material';
import useEntityStatus from 'hooks/entityStatus/useEntityStatus';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Refresh } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';

export default function RefreshButton() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const { refresh } = useEntityStatus(catalogName);

    const hydrating = useEntityStatusStore((state) => !state.hydrated);
    const loading = useEntityStatusStore((state) => state.loading);
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
