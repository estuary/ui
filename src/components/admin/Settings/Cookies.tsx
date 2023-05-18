import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { showCookieDrawer } from 'services/osano';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

function AdminCookies() {
    return (
        <Box sx={boxStyling}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
                <FormattedMessage id="admin.cookies" />
            </Typography>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id="admin.cookies.message" />
            </Typography>

            <Button onClick={showCookieDrawer}>
                <FormattedMessage id="cta.configure" />
            </Button>
        </Box>
    );
}

export default AdminCookies;
