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
                <Typography variant="h6">Access Token</Typography>
                <Typography>
                    If you want to use the CLI client you will need an access
                    token. You can copy the one below to use.
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
