import { Typography } from '@mui/material';
import FullPageDialog from 'components/fullPage/Dialog';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const NoGrants = () => {
    useBrowserTitle('browserTitle.noGrants');

    return (
        <FullPageDialog>
            <Typography sx={{ mb: 5 }}>
                <FormattedMessage id="noGrants.main.message" />
            </Typography>
        </FullPageDialog>
    );
};

export default NoGrants;
