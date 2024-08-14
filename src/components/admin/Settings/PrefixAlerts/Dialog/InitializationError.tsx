import { Box } from '@mui/material';
import Error from 'components/shared/Error';
import useAlertSubscriptionsStore from '../useAlertSubscriptionsStore';

export default function InitializationError() {
    const serverError = useAlertSubscriptionsStore(
        (state) => state.serverError
    );

    if (!serverError) {
        return null;
    }

    return (
        <Box style={{ marginBottom: 16 }}>
            <Error condensed error={serverError} severity="error" />
        </Box>
    );
}
