import { Stack, Typography } from '@mui/material';
import FullPageWrapper from 'app/FullPageWrapper';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const NoGrants = () => {
    useBrowserTitle('routeTitle.noGrants');

    return (
        <FullPageWrapper>
            <Stack>
                <Typography variant="h5" align="center" sx={{ mb: 1.5 }}>
                    <FormattedMessage id="noGrants.main.title" />
                </Typography>

                <Typography sx={{ mb: 5 }}>
                    <FormattedMessage id="noGrants.main.message" />
                </Typography>
            </Stack>
        </FullPageWrapper>
    );
};

export default NoGrants;
