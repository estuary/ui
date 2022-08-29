import { Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const TITLE = 'browserTitle.error.pageNotFound';

const PageNotFound = () => {
    useBrowserTitle(TITLE);

    return (
        <PageContainer
            pageTitleProps={{
                header: TITLE,
            }}
        >
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                <FormattedMessage id="pageNotFound.heading" />
            </Typography>
        </PageContainer>
    );
};

export default PageNotFound;
