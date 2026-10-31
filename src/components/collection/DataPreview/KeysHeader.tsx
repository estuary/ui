import { Typography } from '@mui/material';

import { defaultOutline } from 'src/context/Theme';

// Shared by the key list and its loading skeleton so the two line up.
export function KeysHeader() {
    return (
        <Typography
            component="div"
            sx={{
                p: 1,
                fontWeight: 500,
                flexShrink: 0,
                borderBottom: (theme) => defaultOutline[theme.palette.mode],
            }}
        >
            Keys
        </Typography>
    );
}
