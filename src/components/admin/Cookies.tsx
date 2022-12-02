import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { showCookieDrawer } from 'services/osano';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

function AdminCookies() {
    useBrowserTitle('browserTitle.admin.cookies');

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.cookies.title,
            }}
        >
            <AdminTabs />
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
        </PageContainer>
    );
}

export default AdminCookies;
