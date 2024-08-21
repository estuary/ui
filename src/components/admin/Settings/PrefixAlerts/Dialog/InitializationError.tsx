import { Stack } from '@mui/material';
import Error from 'components/shared/Error';
import { hasLength } from 'utils/misc-utils';
import useAlertSubscriptionsStore from '../useAlertSubscriptionsStore';

export default function InitializationError() {
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
                        key={`save-error-${index}`}
                        severity="error"
                    />
                ) : null
            )}
        </Stack>
    );
}
