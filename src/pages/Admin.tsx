import {
    Box,
    TextareaAutosize,
    Toolbar,
    Typography,
    type SxProps,
    type Theme,
} from '@mui/material';
import { Auth } from '@supabase/ui';
import PageContainer from 'components/shared/PageContainer';
import AccessGrantsTable from 'components/tables/AccessGrants';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Admin = () => {
    useBrowserTitle('browserTitle.admin');

    const { session } = Auth.useUser();

    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="admin.header" />
                </Typography>
            </Toolbar>

            <AccessGrantsTable />

            <Box sx={boxStyling}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                    <FormattedMessage id="admin.accessToken" />
                </Typography>

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.accessToken.message" />
                </Typography>

                <TextareaAutosize
                    minRows={4}
                    style={{ width: '100%' }}
                    value={session?.access_token}
                    id="accessTokenValue"
                />
            </Box>
        </PageContainer>
    );
};

export default Admin;
