import { Box, Stack, Typography } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import { useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import SectionUpdated from './Overview/SectionUpdated';
import RefreshButton from './RefreshButton';
import SectionFormatter from './SectionFormatter';
import SectionViews from './SectionViews';

export default function Status() {
    const intl = useIntl();

    const setActive = useEntityStatusStore((state) => state.setActive);

    useMount(() => {
        setActive(true);
    });

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

            <SectionViews />
        </Stack>
    );
}
