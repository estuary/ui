import { Grid, TextField } from '@mui/material';

import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import PrefixedName from 'src/components/inputs/PrefixedName';

interface Props {
    staticPrefix?: string;
}

export default function PrefixField({ staticPrefix }: Props) {
    const intl = useIntl();

    const setSubscribedPrefix = useAlertSubscriptionsStore(
        (state) => state.setSubscribedPrefix
    );

    useMount(() => {
        if (staticPrefix && staticPrefix.length > 0) {
            setSubscribedPrefix(staticPrefix, null);
        }
    });

    return (
        <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            {staticPrefix ? (
                <TextField
                    InputProps={{
                        sx: { borderRadius: 3 },
                    }}
                    fullWidth
                    label={intl.formatMessage({
                        id: 'common.tenant',
                    })}
                    required
                    size="small"
                    value={staticPrefix}
                    variant="outlined"
                />
            ) : (
                <PrefixedName
                    label={intl.formatMessage({
                        id: 'common.tenant',
                    })}
                    onChange={setSubscribedPrefix}
                    prefixOnly
                    required
                    size="small"
                    validateOnLoad
                />
            )}
        </Grid>
    );
}
