import { Button, Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const NoGrants = () => {
    useBrowserTitle('browserTitle.noGrants');

    const supabaseClient = useClient();

    const handlers = {
        logout: async () => {
            await supabaseClient.auth.signOut();
        },
    };

    return (
        <FullPageDialog>
            <Typography sx={{ mb: 5 }}>
                <FormattedMessage id="noGrants.main.message" />
            </Typography>
            <Button
                onClick={() => {
                    void handlers.logout();
                }}
            >
                <FormattedMessage id="cta.logout" />
            </Button>
        </FullPageDialog>
    );
};

export default NoGrants;
