import { Box, Stack, Typography } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useIntl } from 'react-intl';
import EntityStatusHydrator from 'stores/EntityStatus/Hydrator';
import SectionUpdated from './Overview/SectionUpdated';
import RefreshButton from './RefreshButton';
import SectionFormatter from './SectionFormatter';
import SectionViews from './SectionViews';
import ServerError from './ServerError';

export default function Status() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    // const hasSupportRole = useUserInfoSummaryStore(
    //     (state) => state.hasSupportAccess
    // );

    // if (!hasSupportRole) {
    //     return null;
    // }

    return (
        <EntityStatusHydrator catalogName={catalogName}>
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
                            <Typography
                                variant="h6"
                                style={{ marginBottom: 4 }}
                            >
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
        </EntityStatusHydrator>
    );
}
