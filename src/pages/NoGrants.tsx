import { FormattedMessage } from 'react-intl';

import { Stack, Typography } from '@mui/material';

import FullPageWrapper from 'directives/FullPageWrapper';

import useBrowserTitle from 'hooks/useBrowserTitle';

const NoGrants = () => {
    useBrowserTitle('routeTitle.noGrants');

    return (
        <FullPageWrapper>
            <Stack spacing={2}>
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
