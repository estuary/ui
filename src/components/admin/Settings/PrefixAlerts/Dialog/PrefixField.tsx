import { Grid, Skeleton, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import PrefixedName from 'src/components/inputs/PrefixedName';

interface Props {
    staticPrefix?: string;
}

export default function PrefixField({ staticPrefix }: Props) {
    const intl = useIntl();

    const subscriptions = useAlertSubscriptionsStore(
        (state) => state.subscriptions
    );
    const updatePrefix = useAlertSubscriptionsStore(
        (state) => state.updatePrefix
    );

    return (
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex' }}>
            {subscriptions === undefined ? (
                <Skeleton height={38} width={345} />
            ) : staticPrefix ? (
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
                    onChange={updatePrefix}
                    prefixOnly
                    required
                    size="small"
                    validateOnLoad
                />
            )}
        </Grid>
    );
}
