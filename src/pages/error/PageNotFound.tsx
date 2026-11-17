import { Typography } from '@mui/material';

import usePageTitle from 'src/hooks/usePageTitle';

const TITLE = 'routeTitle.error.pageNotFound';

const PageNotFound = () => {
    usePageTitle({
        header: TITLE,
    });

    return (
        <Typography variant="h5" align="center" sx={{ mb: 2 }}>
            Sorry, that page cannot be found.
        </Typography>
    );
};

export default PageNotFound;
