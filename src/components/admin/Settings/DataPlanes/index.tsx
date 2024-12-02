import { Stack, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import DataPlanesTable from 'components/tables/DataPlanes';
import { useIntl } from 'react-intl';

const docsUrl = 'https://docs.estuary.dev/getting-started/deployment-options/';

function DataPlanes() {
    const intl = useIntl();

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
                <Typography
                    component="div"
                    variant="h6"
                    sx={{ m: 2, alignItems: 'center' }}
                >
                    {intl.formatMessage({
                        id: 'admin.dataPlanes.private.header',
                    })}
                </Typography>
                <ExternalLink link={docsUrl}>
                    {intl.formatMessage({ id: 'terms.documentation' })}
                </ExternalLink>
            </Stack>

            <DataPlanesTable />
        </Stack>
    );
}

export default DataPlanes;
