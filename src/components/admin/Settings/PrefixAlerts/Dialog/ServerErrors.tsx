import { Stack } from '@mui/material';


import Error from 'src/components/shared/Error';
import { hasLength } from 'src/utils/misc-utils';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

export default function ServerErrors() {
    const serverErrors = useAlertSubscriptionsStore((state) =>
        [state.initializationError].concat(state.saveErrors)
    );

    if (!hasLength(serverErrors)) {
        return null;
    }

    return (
        <Stack spacing={1} style={{ marginBottom: 16 }}>
            {serverErrors.map((error, index) =>
                error ? (
                    <Error
                        condensed
                        error={error}
                        key={`prefix-alert-save-error-${index}`}
                        severity="error"
                    />
                ) : null
            )}
        </Stack>
    );
}
