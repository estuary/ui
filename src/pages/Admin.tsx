import {
    Box,
    Toolbar,
    Typography,
    type SxProps,
    type Theme
} from '@mui/material';
import { Auth } from '@supabase/ui';
import PageContainer from 'components/shared/PageContainer';
import ConnectorsTable from 'components/tables/Connectors';
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

            <Box sx={boxStyling}>
                <ConnectorsTable />
            </Box>

            <Box sx={boxStyling}>
                <b>Access Token:</b> <Typography>{session?.access_token}</Typography>
            </Box>
        </PageContainer>
    );
};

export default Admin;
