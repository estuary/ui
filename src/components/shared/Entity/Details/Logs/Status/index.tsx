import { Box, Button, Stack, Typography } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import useEntityStatus from 'hooks/entityStatus/useEntityStatus';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Refresh } from 'iconoir-react';
import { useIntl } from 'react-intl';
import SectionUpdated from './Overview/SectionUpdated';
import SectionFormatter from './SectionFormatter';
import SectionViews from './SectionViews';

export default function Status() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const { data, refresh } = useEntityStatus(catalogName);

    return (
        <Stack spacing={2} style={{ marginTop: 40 }}>
            <UnderDev />

            <Stack
                direction="row"
                spacing={4}
                style={{ justifyContent: 'space-between' }}
            >
                <Box>
                    <Stack
                        direction="row"
                        spacing={2}
                        style={{ alignItems: 'center', marginBottom: 2 }}
                    >
                        <Typography variant="h6" style={{ marginBottom: 4 }}>
                            {intl.formatMessage({
                                id: 'details.ops.status.header',
                            })}
                        </Typography>

                        <Button
                            variant="text"
                            startIcon={<Refresh style={{ fontSize: 12 }} />}
                            onClick={() => refresh()}
                            disabled={data === undefined}
                        >
                            {intl.formatMessage({ id: 'cta.refresh' })}
                        </Button>
                    </Stack>

                    <SectionUpdated />
                </Box>

                <SectionFormatter />
            </Stack>

            <SectionViews />
        </Stack>
    );
}
