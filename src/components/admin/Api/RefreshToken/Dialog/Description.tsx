import { TextField } from '@mui/material';

import { useRefreshTokenStore } from '../Store/create';
import { useIntl } from 'react-intl';

function RefreshTokenDescription() {
    const intl = useIntl();

    const description = useRefreshTokenStore((state) => state.description);
    const updateDescription = useRefreshTokenStore(
        (state) => state.updateDescription
    );

    return (
        <TextField
            InputProps={{
                sx: { borderRadius: 3 },
            }}
            helperText={intl.formatMessage({
                id: 'admin.cli_api.refreshToken.dialog.label',
            })}
            label={intl.formatMessage({
                id: 'data.description',
            })}
            onChange={(event) => updateDescription(event.target.value)}
            required
            size="small"
            sx={{ flexGrow: 1 }}
            value={description}
            variant="outlined"
        />
    );
}

export default RefreshTokenDescription;
