import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SectionUpdated from 'src/components/shared/Entity/Details/Logs/Status/Overview/SectionUpdated';
import RefreshButton from 'src/components/shared/Entity/Details/Logs/Status/RefreshButton';
import SectionFormatter from 'src/components/shared/Entity/Details/Logs/Status/SectionFormatter';
import SectionViews from 'src/components/shared/Entity/Details/Logs/Status/SectionViews';
import ServerError from 'src/components/shared/Entity/Details/Logs/Status/ServerError';
import UnderDev from 'src/components/shared/UnderDev';

export default function Status() {
    const intl = useIntl();

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

                        <RefreshButton />
                    </Stack>

                    <SectionUpdated />
                </Box>

                <SectionFormatter />
            </Stack>

            <ServerError />

            <SectionViews />
        </Stack>
    );
}
