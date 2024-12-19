import { Box, Divider, Stack, Typography } from '@mui/material';
import ControllerStatusHistoryTable from 'components/tables/ControllerStatusHistory';
import useEntityStatus from 'hooks/entityStatus/useEntityStatus';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useIntl } from 'react-intl';

export default function Status() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const intl = useIntl();

    const { data } = useEntityStatus(catalogName);

    return (
        <Stack spacing={2} style={{ marginTop: 40 }}>
            <Box>
                <Typography variant="h6" style={{ marginBottom: 4 }}>
                    {intl.formatMessage({ id: 'details.ops.status.header' })}
                </Typography>

                <Typography>
                    This is a placeholder description for this section that is
                    used to mock the Account Access tab of the Admin page.
                </Typography>
            </Box>

            <Divider />

            <Typography
                style={{ fontSize: 18, fontWeight: 400, marginBottom: 24 }}
            >
                {intl.formatMessage({
                    id: 'details.ops.status.table.header',
                })}
            </Typography>

            <ControllerStatusHistoryTable
                history={data?.controller_status.publications?.history}
                serverErrorExists={false}
            />
        </Stack>
    );
}
