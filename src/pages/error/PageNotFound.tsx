import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

import usePageTitle from 'hooks/usePageTitle';

const TITLE = 'routeTitle.error.pageNotFound';

const PageNotFound = () => {
    usePageTitle({
        header: TITLE,
    });

    return (
        <Typography variant="h5" align="center" sx={{ mb: 2 }}>
            <FormattedMessage id="pageNotFound.heading" />
        </Typography>
    );
};

export default PageNotFound;
