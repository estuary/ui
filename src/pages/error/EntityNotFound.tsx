import { Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const EntityNotFound = () => {
    useBrowserTitle('browserTitle.error.entityNotFound');

    return (
        <PageContainer
            pageTitleProps={{
                header: 'routeTitle.error.entityNotFound',
            }}
        >
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                <FormattedMessage id="entityNotFound.heading" />
            </Typography>

            <Typography align="center">
                <FormattedMessage id="entityNotFound.message" />
            </Typography>
        </PageContainer>
    );
};

export default EntityNotFound;
