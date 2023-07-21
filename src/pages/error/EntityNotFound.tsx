import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

import usePageTitle from 'hooks/usePageTitle';

const EntityNotFound = () => {
    usePageTitle({
        header: 'routeTitle.error.entityNotFound',
    });

    return (
        <>
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                <FormattedMessage id="entityNotFound.heading" />
            </Typography>

            <Typography align="center">
                <FormattedMessage id="entityNotFound.message" />
            </Typography>
        </>
    );
};

export default EntityNotFound;
