import {
    FormControl,
    FormControlLabel,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import { Auth } from '@supabase/ui';
import { getAlertMessageByName, getAlertMethodByPrefix } from 'api/alerts';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';

function Settings() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { user } = Auth.useUser();

    if (user?.id) {
        console.log(user.id);
    }

    // The three calls below should be conditional: first check to see if a row exists in
    // the alerts table for this user and task. If so, source data from there; if not, make
    // the three calls below to update the table. All the calls below should be in the click
    // handler for the switch.
    getLiveSpecsByCatalogName(catalogName, 'capture');

    const [prefix] = catalogName.split('/', 1);
    getAlertMethodByPrefix(prefix);

    getAlertMessageByName('data-not-processed-in-interval');

    return (
        <Stack spacing={1}>
            <Typography variant="h6">Settings</Typography>

            <Stack spacing={2} direction="row">
                <FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                value={false}
                                checked={false}
                                disabled={!user?.id}
                                onChange={(event, checked) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    console.log('clicked', checked);
                                    // setAutoDiscover(checked);
                                }}
                            />
                        }
                        label={
                            <FormattedMessage id="workflows.autoDiscovery.label.optIntoDiscovery" />
                        }
                    />
                </FormControl>
            </Stack>
        </Stack>
    );
}

export default Settings;
