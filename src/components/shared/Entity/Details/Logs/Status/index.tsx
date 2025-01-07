import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import ControllerStatusHistoryTable from 'components/tables/ControllerStatusHistory';
import useEntityStatus from 'hooks/entityStatus/useEntityStatus';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Refresh } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { isEntityControllerStatus } from 'utils/entityStatus-utils';
import Overview from './Overview';

export default function Status() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const { data, refresh } = useEntityStatus(catalogName);

    return (
        <Stack spacing={2} style={{ marginTop: 40 }}>
            <Box>
                <Stack
                    direction="row"
                    spacing={2}
                    style={{ alignItems: 'center' }}
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

                <Typography>
                    This is a placeholder description for this section that is
                    used to mock the Account Access tab of the Admin page.
                </Typography>
            </Box>

            <Overview />

            <Divider />

            <Typography
                style={{ fontSize: 18, fontWeight: 400, marginBottom: 24 }}
            >
                {intl.formatMessage({
                    id: 'details.ops.status.table.header',
                })}
            </Typography>

            <ControllerStatusHistoryTable
                history={
                    data?.[0].controller_status &&
                    isEntityControllerStatus(data[0].controller_status)
                        ? data[0].controller_status.publications?.history
                        : []
                }
                serverErrorExists={false}
            />
        </Stack>
    );
}
