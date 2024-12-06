import { Stack, ToggleButtonGroup, Typography } from '@mui/material';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import ExternalLink from 'components/shared/ExternalLink';
import { useDataPlaneScope } from 'context/DataPlaneScopeContext';
import { useIntl } from 'react-intl';
import { DATA_PLANE_SETTINGS } from 'settings/dataPlanes';

const docsUrl = 'https://docs.estuary.dev/getting-started/deployment-options/';

function Header() {
    const intl = useIntl();

    const { dataPlaneScope, toggleScope } = useDataPlaneScope();

    return (
        <Stack direction="row" spacing={2}>
            <Typography
                component="span"
                variant="h6"
                sx={{
                    alignItems: 'center',
                }}
            >
                {intl.formatMessage({
                    id: DATA_PLANE_SETTINGS[dataPlaneScope].table.headerIntlKey,
                })}
            </Typography>

            <ToggleButtonGroup
                color="primary"
                size="small"
                exclusive
                value={dataPlaneScope}
            >
                <OutlinedToggleButton
                    onClick={() => toggleScope()}
                    selected={dataPlaneScope === 'private'}
                    size="small"
                    value="private"
                >
                    {intl.formatMessage({
                        id: 'admin.dataPlanes.private.option',
                    })}
                </OutlinedToggleButton>
                <OutlinedToggleButton
                    onClick={() => toggleScope()}
                    selected={dataPlaneScope === 'public'}
                    size="small"
                    value="public"
                >
                    {intl.formatMessage({
                        id: 'admin.dataPlanes.public.option',
                    })}
                </OutlinedToggleButton>
            </ToggleButtonGroup>

            <ExternalLink link={docsUrl} sx={{ ml: 0 }}>
                {intl.formatMessage({ id: 'terms.documentation' })}
            </ExternalLink>
        </Stack>
    );
}

export default Header;
